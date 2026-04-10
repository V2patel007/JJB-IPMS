import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, doc, updateDoc, serverTimestamp } from '@/lib/firebase';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/components/AuthGuard';
import { UserRequest, UserRole } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  UserPlus, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Badge } from '@/components/ui/badge';

export default function UserManagement() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'USER' as UserRole
  });

  useEffect(() => {
    if (!db) return;

    const q = collection(db, 'userRequests');
    const unsubscribe = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() } as UserRequest)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'userRequests'), {
        email: formData.email,
        displayName: formData.displayName,
        requestedRole: formData.role,
        status: 'PENDING',
        requestedBy: user.uid,
        createdAt: serverTimestamp()
      });
      
      setFormData({ email: '', displayName: '', role: 'USER' });
      toast.success("User addition request submitted for Superadmin approval");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'userRequests');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAction = async (requestId: string, action: 'APPROVED' | 'REJECTED') => {
    if (!db) return;
    try {
      const requestRef = doc(db, 'userRequests', requestId);
      await updateDoc(requestRef, { status: action });
      toast.success(`Request ${action.toLowerCase()} successfully`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'userRequests');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending Approval</Badge>;
      case 'APPROVED': return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium uppercase text-xs tracking-widest">Manage user access and approval requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Request Form (Visible to Admins) */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
          <div className="lg:col-span-1">
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-orange-600" />
                  Request New User
                </CardTitle>
                <CardDescription>Submit a request to add a new user to the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="user@example.com" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      required
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Requested Role</Label>
                    <Select value={formData.role} onValueChange={(v: UserRole) => setFormData({...formData, role: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Standard User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full bg-orange-600 hover:bg-orange-700">
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Recent Requests
          </h2>
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />)}
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.sort((a, b) => b.createdAt?.toISOString()?.localeCompare(a.createdAt?.toISOString())).map((req) => (
                <Card key={req.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <UserIcon className="h-6 w-6 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{req.displayName}</p>
                        <p className="text-sm text-slate-500">{req.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase">{req.requestedRole}</Badge>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                    </div>

                    {user?.role === 'SUPERADMIN' && req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Button 
                          size="sm" 
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                          onClick={() => handleAction(req.id, 'APPROVED')}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex-1 md:flex-none"
                          onClick={() => handleAction(req.id, 'REJECTED')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="p-12 text-center text-slate-500">
                <p>No user requests found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
