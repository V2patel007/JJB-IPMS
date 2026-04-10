import React from 'react';
import ApprovalList from '@/components/ApprovalList';

export default function SuperadminApproval() {
  return (
    <ApprovalList 
      targetStatus="PENDING_SUPERADMIN" 
      nextStatus="PUBLISHED" 
      role="SUPERADMIN" 
    />
  );
}
