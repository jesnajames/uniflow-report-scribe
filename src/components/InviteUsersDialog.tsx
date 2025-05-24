
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL
interface InviteUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topicId: string;
  topicTitle: string;
}

export function InviteUsersDialog({ open, onOpenChange, topicId, topicTitle }: InviteUsersDialogProps) {
  const [emails, setEmails] = useState<string[]>(['']);
  const [isInviting, setIsInviting] = useState(false);

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleInvite = async () => {
    const validEmails = emails.filter(email => email.trim() && email.includes('@'));
    
    if (validEmails.length === 0) {
      toast({
        title: "No valid emails",
        description: "Please enter at least one valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsInviting(true);
    
    try {
      const response = await fetch(`${BASE_URL}/api/topics/${topicId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: validEmails,
        }),
      });

      if (response.ok) {
        toast({
          title: "Invitations sent",
          description: `Successfully invited ${validEmails.length} user${validEmails.length !== 1 ? 's' : ''} to collaborate.`,
        });
        setEmails(['']);
        onOpenChange(false);
      } else {
        throw new Error('Failed to send invitations');
      }
    } catch (error) {
      toast({
        title: "Failed to send invitations",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Users to Collaborate</DialogTitle>
          <DialogDescription>
            Invite others to contribute to "{topicTitle}". They'll receive an email invitation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label>Email Addresses</Label>
          {emails.map((email, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => updateEmail(index, e.target.value)}
                placeholder="user@example.com"
                className="flex-1"
              />
              {emails.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeEmailField(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addEmailField}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Another Email
          </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleInvite}
            disabled={isInviting}
          >
            {isInviting ? 'Sending...' : 'Send Invitations'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
