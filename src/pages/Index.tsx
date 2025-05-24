
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTopicDialog } from '@/components/CreateTopicDialog';
import { toast } from '@/hooks/use-toast';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

const Index = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await fetch('/api/topics');
      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      } else {
        // Fallback to localStorage for development
        const savedTopics = localStorage.getItem('topics');
        if (savedTopics) {
          setTopics(JSON.parse(savedTopics));
        }
      }
    } catch (error) {
      console.log('API not available, using localStorage');
      const savedTopics = localStorage.getItem('topics');
      if (savedTopics) {
        setTopics(JSON.parse(savedTopics));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTopic = async (title: string, description?: string) => {
    try {
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (response.ok) {
        const newTopic = await response.json();
        setTopics([newTopic, ...topics]);
        setIsCreateDialogOpen(false);
        toast({
          title: "Topic created",
          description: "Your new topic has been created successfully.",
        });
      } else {
        throw new Error('Failed to create topic');
      }
    } catch (error) {
      // Fallback to localStorage for development
      console.log('API not available, using localStorage fallback');
      const newTopic: Topic = {
        id: Date.now().toString(),
        title,
        description,
        created_at: new Date().toISOString(),
      };
      
      const updatedTopics = [newTopic, ...topics];
      setTopics(updatedTopics);
      localStorage.setItem('topics', JSON.stringify(updatedTopics));
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Topic created",
        description: "Your new topic has been created successfully (using local storage).",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UniNoter</h1>
            <p className="text-gray-600 mt-1">Collaborative document creation made simple</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Topic
          </Button>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-4">Create your first topic to start collaborating</p>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Topic
                </Button>
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Link key={topic.id} to={`/topic/${topic.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-xl">{topic.title}</CardTitle>
                    {topic.description && (
                      <CardDescription className="text-gray-600">
                        {topic.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created {formatDate(topic.created_at)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>

        <CreateTopicDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateTopic={handleCreateTopic}
        />
      </div>
    </div>
  );
};

export default Index;
