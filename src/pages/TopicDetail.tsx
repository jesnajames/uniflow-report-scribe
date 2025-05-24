
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Calendar, Brain, FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import type { Topic } from './Index';

export interface Contribution {
  id: string;
  topic_id: string;
  content: string;
  created_at: string;
}

export interface Summary {
  topic_id: string;
  content: string;
  generated_at: string;
}

const TopicDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [newContribution, setNewContribution] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Load topic
    const savedTopics = localStorage.getItem('topics');
    if (savedTopics) {
      const topics = JSON.parse(savedTopics);
      const foundTopic = topics.find((t: Topic) => t.id === id);
      setTopic(foundTopic || null);
    }

    // Load contributions
    const savedContributions = localStorage.getItem(`contributions_${id}`);
    if (savedContributions) {
      setContributions(JSON.parse(savedContributions));
    }

    // Load summary
    const savedSummary = localStorage.getItem(`summary_${id}`);
    if (savedSummary) {
      setSummary(JSON.parse(savedSummary));
    }
  }, [id]);

  const handleSubmitContribution = () => {
    if (!newContribution.trim() || !id) return;

    const contribution: Contribution = {
      id: Date.now().toString(),
      topic_id: id,
      content: newContribution.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedContributions = [contribution, ...contributions];
    setContributions(updatedContributions);
    localStorage.setItem(`contributions_${id}`, JSON.stringify(updatedContributions));
    setNewContribution('');
    
    toast({
      title: "Contribution added",
      description: "Your contribution has been successfully added to the topic.",
    });
  };

  const handleGenerateReport = async () => {
    if (!id || contributions.length === 0) {
      toast({
        title: "No contributions",
        description: "Add some contributions before generating a report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate API call to FastAPI backend
      // In real implementation: POST /topics/${id}/generate-summary
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSummary: Summary = {
        topic_id: id,
        content: `# Summary Report for ${topic?.title}

This document presents a comprehensive analysis of all contributions submitted for this topic.

## Key Insights

Based on the ${contributions.length} contribution${contributions.length !== 1 ? 's' : ''} received, several important themes emerge:

${contributions.slice(0, 3).map((contrib, index) => 
  `### Insight ${index + 1}
${contrib.content.substring(0, 200)}${contrib.content.length > 200 ? '...' : ''}`
).join('\n\n')}

## Recommendations

1. **Continue the discussion** - The contributions show diverse perspectives that merit further exploration
2. **Action items** - Consider implementing the practical suggestions mentioned in the contributions
3. **Follow-up** - Schedule regular reviews to track progress on discussed topics

## Conclusion

The collaborative effort has produced valuable insights that can guide future decision-making and strategy development.

*Report generated on ${new Date().toLocaleDateString()} from ${contributions.length} contributions*`,
        generated_at: new Date().toISOString(),
      };

      setSummary(mockSummary);
      localStorage.setItem(`summary_${id}`, JSON.stringify(mockSummary));
      
      toast({
        title: "Report generated",
        description: "The collaborative report has been successfully generated.",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!topic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic not found</h2>
          <p className="text-gray-600 mb-4">The topic you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Topics
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{topic.title}</h1>
          {topic.description && (
            <p className="text-gray-600">{topic.description}</p>
          )}
        </div>

        {/* New Contribution Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Add Your Contribution</CardTitle>
            <CardDescription>
              Share your thoughts, ideas, or insights on this topic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                value={newContribution}
                onChange={(e) => setNewContribution(e.target.value)}
                placeholder="Type your contribution here..."
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newContribution.length} characters
                </span>
                <Button 
                  onClick={handleSubmitContribution}
                  disabled={!newContribution.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit Contribution
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Report Button */}
        <div className="mb-8">
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || contributions.length === 0}
            className="bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <Brain className="w-5 h-5 mr-2" />
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </Button>
        </div>

        {/* Generated Summary */}
        {summary && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Final Report for {topic.title}</CardTitle>
                  <CardDescription>
                    Generated on {formatDateTime(summary.generated_at)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Export DOCX
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {summary.content}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contributions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Contributions ({contributions.length})
          </h2>
          
          {contributions.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <h3 className="font-medium text-gray-900 mb-1">No contributions yet</h3>
                <p className="text-gray-600 text-sm">Be the first to share your thoughts on this topic</p>
              </CardContent>
            </Card>
          ) : (
            contributions.map((contribution) => (
              <Card key={contribution.id}>
                <CardContent className="pt-6">
                  <p className="text-gray-900 mb-3 leading-relaxed">
                    {contribution.content}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDateTime(contribution.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;
