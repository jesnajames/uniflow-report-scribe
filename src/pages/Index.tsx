
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTopicDialog } from '@/components/CreateTopicDialog';

export interface Topic {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

const Index = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    // Load topics from localStorage
    const savedTopics = localStorage.getItem('topics');
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics));
    }
  }, []);

  const handleCreateTopic = (title: string, description?: string) => {
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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
