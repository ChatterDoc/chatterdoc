import React, { useState, useEffect } from 'react';
import AuthNav from '@/components/AuthNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ApiKey } from '@/utils/types';
import { getUserApiKeys, generateApiKey, updateApiKeyName, deleteApiKey } from '@/services/feedbackService';
import { Trash2, Plus, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editedKeyName, setEditedKeyName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKeys = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const keys = await getUserApiKeys(user.id);
          setApiKeys(keys);
        } catch (error) {
          console.error('Error fetching API keys:', error);
          toast({
            title: "Error",
            description: "Failed to load API keys.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadApiKeys();
  }, [user, toast]);

  const handleGenerateApiKey = async () => {
    if (user?.id) {
      try {
        setLoading(true);
        const newKey = await generateApiKey(newKeyName || 'Default API Key', user.id);
        setApiKeys(prevKeys => [newKey, ...prevKeys]);
        setNewKeyName('');
        toast({
          title: "Success",
          description: "New API key generated successfully.",
        });
      } catch (error) {
        console.error('Error generating API key:', error);
        toast({
          title: "Error",
          description: "Failed to generate API key.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleStartEdit = (key: ApiKey) => {
    setEditingKeyId(key.id);
    setEditedKeyName(key.name);
  };

  const handleCancelEdit = () => {
    setEditingKeyId(null);
    setEditedKeyName('');
  };

  const handleSaveEdit = async (keyId: string) => {
    try {
      setLoading(true);
      await updateApiKeyName(keyId, editedKeyName);
      setApiKeys(prevKeys =>
        prevKeys.map(key =>
          key.id === keyId ? { ...key, name: editedKeyName } : key
        )
      );
      setEditingKeyId(null);
      setEditedKeyName('');
      toast({
        title: "Success",
        description: "API key name updated successfully.",
      });
    } catch (error) {
      console.error('Error updating API key name:', error);
      toast({
        title: "Error",
        description: "Failed to update API key name.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      setLoading(true);
      await deleteApiKey(keyId);
      setApiKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
      toast({
        title: "Success",
        description: "API key deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthNav />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">API Keys</h2>
          <p className="text-sm text-muted-foreground">
            Manage your API keys for accessing the Chatter Doc API.
          </p>

          <div className="mb-4">
            <Label htmlFor="newKeyName" className="block text-sm font-medium text-gray-700">
              New API Key Name
            </Label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <Input
                type="text"
                name="newKeyName"
                id="newKeyName"
                className="flex-1 focus:ring-primary focus:border-primary block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                placeholder="Enter key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button
                className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                onClick={handleGenerateApiKey}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                <span>Generate Key</span>
              </Button>
            </div>
          </div>

          <Table>
            <TableCaption>A list of your API keys.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>API Key</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.id}</TableCell>
                  <TableCell>
                    {editingKeyId === key.id ? (
                      <Input
                        type="text"
                        value={editedKeyName}
                        onChange={(e) => setEditedKeyName(e.target.value)}
                      />
                    ) : (
                      key.name
                    )}
                  </TableCell>
                  <TableCell>{key.apiKey}</TableCell>
                  <TableCell>{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {editingKeyId === key.id ? (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleSaveEdit(key.id)}
                          disabled={loading}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleStartEdit(key)}
                          disabled={loading}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your API key
                                and remove access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteApiKey(key.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
