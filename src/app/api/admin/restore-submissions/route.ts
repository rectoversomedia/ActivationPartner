import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const { error } = await supabaseAdmin.from('submissions').insert([
      {
        id: 'd101f8b8-5fe2-4e9e-b73c-f9dabd450f15',
        submission_code: 'ACT-ANOEA4CL',
        sales_id: 'cf138060-89c6-4b48-9aa7-fa0591b9f496',
        sales_name: 'Sofi',
        pic_id: '13932cd7-5aec-4543-96e1-829ef4640a4f',
        pic_name: 'Rendi',
        campaign_id: '248459e5-a2da-4bc5-8c03-1149cb13f3ac',
        campaign_name: 'FIFGO Download & Rating',
        customer_name: 'maulana aslam',
        customer_email: 'maulanaaslam776@gmail.com',
        customer_phone: '+62895400862777',
        customer_phone_masked: '+628****2777',
        device_info: 'Android-Other',
        screenshot_download: true,
        screenshot_register: true,
        screenshot_rating: true,
        status: 'valid',
        fraud_flags: '[]',
        fraud_decision: 'valid',
        fraud_reasons: '[]',
        fraud_score: 0,
        device_fingerprint_hash: '820003b13160f04f2ace1e2b8b1dbf672c7a0c8d66dbcd1c6d64d4f4eb77b862',
        behavior_data: '{"time_on_page_ms":60000,"typing_speeds":[]}',
        ip_address: '172.71.124.137',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
        created_at: '2026-07-21T09:45:00.000000+00:00',
      },
      {
        id: 'e5507eb3-1f38-4b31-8681-ba24d6f00da5',
        submission_code: 'ACT-795YLBZQ',
        sales_id: 'cf138060-89c6-4b48-9aa7-fa0591b9f496',
        sales_name: 'Sofi',
        pic_id: '13932cd7-5aec-4543-96e1-829ef4640a4f',
        pic_name: 'Rendi',
        campaign_id: '248459e5-a2da-4bc5-8c03-1149cb13f3ac',
        campaign_name: 'FIFGO Download & Rating',
        customer_name: 'arfa isnani',
        customer_email: 'arfaisnani20@gmail.com',
        customer_phone: '+6285759651423',
        customer_phone_masked: '+628****1423',
        device_info: 'Android-Other',
        screenshot_download: true,
        screenshot_register: true,
        screenshot_rating: true,
        status: 'valid',
        fraud_flags: '[]',
        fraud_decision: 'valid',
        fraud_reasons: '[]',
        fraud_score: 0,
        device_fingerprint_hash: '820003b13160f04f2ace1e2b8b1dbf672c7a0c8d66dbcd1c6d64d4f4eb77b862',
        behavior_data: '{"time_on_page_ms":60000,"typing_speeds":[]}',
        ip_address: '172.71.124.137',
        user_agent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
        created_at: '2026-07-21T10:02:00.000000+00:00',
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '2 submissions restored' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
