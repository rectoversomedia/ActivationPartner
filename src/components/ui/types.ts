import { type IconProps as PhosphorIconProps } from '@phosphor-icons/react';

export type IconProps = PhosphorIconProps & {
  variant?: 'fill' | 'regular' | 'bold' | 'light' | 'thin' | 'duotone';
};

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<PhosphorIconProps>;
  badge?: number;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<PhosphorIconProps>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan' | 'pink';
}

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface DataTableColumn<T> {
  accessorKey: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}
