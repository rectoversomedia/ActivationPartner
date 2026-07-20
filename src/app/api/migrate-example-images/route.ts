import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Migrate base64 example images to Supabase Storage
export async function POST() {
  try {
    const supabase = await createClient();

    // Get all campaigns
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('id, name, required_evidence');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results = [];
    const debug = [];

    for (const campaign of campaigns || []) {
      let evidenceList: any[] = [];
      try {
        evidenceList = typeof campaign.required_evidence === 'string'
          ? JSON.parse(campaign.required_evidence)
          : (campaign.required_evidence || []);
      } catch {
        evidenceList = [];
      }

      debug.push({
        campaign: campaign.name,
        evidenceCount: evidenceList.length,
        evidence: evidenceList.map((e: any) => ({
          label: e.label,
          urlPrefix: (e.example_image_url || '').substring(0, 80),
          isBase64: typeof e.example_image_url === 'string' &&
                    e.example_image_url.startsWith('data:') &&
                    e.example_image_url.includes('base64,'),
          urlLength: (e.example_image_url || '').length,
        })),
      });

      let updated = false;
      const newEvidenceList = [];

      for (let idx = 0; idx < evidenceList.length; idx++) {
        const ev = evidenceList[idx];
        const url = ev.example_image_url;

        if (url && typeof url === 'string' && url.startsWith('data:') && url.includes('base64,')) {
          const matches = url.match(/^data:([^;]+);base64,(.+)$/);
          if (!matches) {
            newEvidenceList.push(ev);
            continue;
          }

          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          const ext = mimeType.split('/')[1] || 'jpg';
          const fileName = `examples/${Date.now()}_${campaign.id.substring(0, 8)}_${idx}.${ext}`;

          try {
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('brand-logos')
              .upload(fileName, buffer, { contentType: mimeType, upsert: true });

            if (!uploadError && uploadData) {
              const { data: urlData } = supabase.storage
                .from('brand-logos')
                .getPublicUrl(fileName);
              newEvidenceList.push({ ...ev, example_image_url: urlData.publicUrl });
              updated = true;
              console.log(`Migrated ${campaign.name} evidence ${idx} -> ${urlData.publicUrl}`);
            } else {
              // Bucket not found or upload error - keep base64
              console.log(`Storage upload failed for ${campaign.name} evidence ${idx}, keeping base64:`, uploadError);
              results.push({ id: campaign.id, name: campaign.name, status: 'skipped', message: `Bucket error at ${idx}, kept base64` });
              newEvidenceList.push(ev);
            }
          } catch (uploadErr: any) {
            console.error(`Upload exception for ${campaign.name} evidence ${idx}:`, uploadErr?.message || uploadErr);
            results.push({ id: campaign.id, name: campaign.name, status: 'skipped', message: `Exception at ${idx}, kept base64` });
            newEvidenceList.push(ev);
          }
        } else {
          newEvidenceList.push(ev);
        }
      }

      if (updated) {
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({ required_evidence: JSON.stringify(newEvidenceList) })
          .eq('id', campaign.id);

        if (updateError) {
          results.push({ id: campaign.id, name: campaign.name, status: 'error', message: updateError.message });
        } else {
          results.push({ id: campaign.id, name: campaign.name, status: 'migrated' });
        }
      } else {
        results.push({ id: campaign.id, name: campaign.name, status: 'skipped', message: 'No base64 images' });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration complete',
      debug,
      results,
      summary: {
        total: results.length,
        migrated: results.filter(r => r.status === 'migrated').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
      },
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
  }
}