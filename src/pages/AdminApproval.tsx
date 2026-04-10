import React from 'react';
import ApprovalList from '@/components/ApprovalList';

export default function AdminApproval() {
  return (
    <ApprovalList 
      targetStatus="PENDING_ADMIN" 
      nextStatus="PENDING_SUPERADMIN" 
      role="ADMIN" 
    />
  );
}
