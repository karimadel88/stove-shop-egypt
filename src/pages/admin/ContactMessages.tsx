import { useEffect, useState } from 'react';
import { messagesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { MessageSquare, Eye, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message: string;
  isRead?: boolean;
  createdAt: string;
}

export default function ContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await messagesApi.list();
      setMessages(response.data.data || response.data || []);
    } catch (error: any) {
      toast.error('فشل في تحميل الرسائل');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessageToDelete(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
      await messagesApi.delete(messageToDelete);
      toast.success('تم حذف الرسالة');
      setMessages(messages.filter((m) => m._id !== messageToDelete));
      if (selectedMessage?._id === messageToDelete) setIsDetailsOpen(false);
      setIsDeleteOpen(false);
      setMessageToDelete(null);
    } catch (error: any) {
      toast.error('فشل في حذف الرسالة');
    }
  };

  const handleView = async (message: ContactMessage) => {
    // Optimistically update read status locally for the modal view
    const updatedMessage = { ...message, isRead: true };
    setSelectedMessage(updatedMessage);
    setIsDetailsOpen(true);
    
    // Update list in background if needed
    if (!message.isRead) {
      try {
        await messagesApi.markAsRead(message._id);
        setMessages(prev => prev.map(m => m._id === message._id ? { ...m, isRead: true } : m));
      } catch (error) {
        // Revert on error if critical, but for read status we can ignore
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8" />
          رسائل التواصل
        </h1>
        <p className="text-muted-foreground">عرض رسائل نموذج التواصـل</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الرسائل الواردة</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد رسائل جديدة</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right w-[250px]">الاسم</TableHead>
                    <TableHead className="text-right">الموضوع</TableHead>
                    <TableHead className="text-right w-[200px]">التاريخ</TableHead>
                    <TableHead className="text-left w-[120px]">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow 
                      key={message._id} 
                      className={`cursor-pointer transition-colors ${
                        !message.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleView(message)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            !message.isRead ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {message.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{message.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{message.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {!message.isRead && (
                            <span className="inline-flex w-fit items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-1">
                              جديد
                            </span>
                          )}
                          <span className={`${!message.isRead ? 'font-bold' : 'text-muted-foreground'}`}>
                            {message.subject || 'بدون محتوى'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(message.createdAt), 'd MMM yyyy', { locale: ar })}
                        </div>
                      </TableCell>
                      <TableCell className="text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleView(message)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={(e) => confirmDelete(message._id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
            <DialogDescription>
              من {selectedMessage?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedMessage.email}</span>
                </div>
                {selectedMessage.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedMessage.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedMessage.createdAt), 'PPPP p', { locale: ar })}
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mt-4">
                <h4 className="font-semibold mb-2 text-sm text-muted-foreground">الرسالة:</h4>
                <p className="whitespace-pre-wrap leading-relaxed">{selectedMessage.message}</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              إغلاق
            </Button>
            <Button 
              variant="destructive" 
              onClick={(e) => selectedMessage && confirmDelete(selectedMessage._id, e as any)}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الرسالة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
