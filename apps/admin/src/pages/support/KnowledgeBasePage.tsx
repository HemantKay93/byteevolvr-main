import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Search, Plus, Filter, FileText, Globe, Lock } from 'lucide-react';

export function KnowledgeBasePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const { SupportService } = await import('@byteevolvr/api-client');
      const response = await SupportService.getKnowledgeBaseArticles();
      setArticles(Array.isArray(response) ? response : response?.data || []);
    } catch (error) {
      console.error('Failed to load KB articles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Knowledge Base</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage help articles, FAQs, and internal documentation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Categories</Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Article
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Search articles by title or keyword..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                  Loading articles...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-on-surface-variant">
                  No articles found.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-on-surface-variant shrink-0" />
                      <div>
                        <div className="font-medium text-primary hover:underline cursor-pointer">
                          {item.title}
                        </div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{item.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      {item.visibility === 'public' ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-on-surface-variant" /> Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-warning" /> Internal
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {item.views?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'published' ? 'success' : 'default'}>
                      {(item.status || 'draft').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface-variant">
                    {new Date(
                      item.lastUpdated || item.updated_at || new Date()
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
