export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';

export type ProjectStatus = 
  | 'DRAFT' 
  | 'PENDING_ADMIN' 
  | 'PENDING_SUPERADMIN' 
  | 'PUBLISHED' 
  | 'REJECTED';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  projectType: string;
  brickType: string;
  images: string[];
  completionStatus: string;
  completionDate: any; // Firestore Timestamp
  builderName: string;
  submittedBy: string;
  submittedAt: any;
  adminFeedback?: string;
  superadminFeedback?: string;
  status: ProjectStatus;
  lastUpdatedAt: any;
}

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface BrickType {
  id: string;
  name: string;
  description?: string;
}

export interface ProjectType {
  id: string;
  name: string;
}

export interface UserRequest {
  id: string;
  email: string;
  displayName: string;
  requestedRole: UserRole;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: string;
  createdAt: any;
}
