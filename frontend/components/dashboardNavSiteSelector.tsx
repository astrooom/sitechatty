'use client';

import { usePathname } from 'next/navigation';

import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
interface DashboardNavProps {

}

export function DashboardNavSiteSelector({

}: DashboardNavProps) {
  return (

    <Select
    // disabled={loading}
    // onValueChange={field.onChange}
    // value={field.value}
    // defaultValue={field.value}
    >
      <SelectTrigger>
        <SelectValue
          defaultValue={"test"}
        // placeholder="Select site"
        />
      </SelectTrigger>

    </Select>

  );
}
