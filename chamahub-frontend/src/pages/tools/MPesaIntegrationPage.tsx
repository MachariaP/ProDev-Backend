// chamahub-frontend/src/pages/tools/MPesaIntegrationPage.tsx
/**
 * M-Pesa Integration Page for handling mobile payments
 * This page allows users to make M-Pesa payments and view transaction history
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Smartphone, Check, CreditCard, 
  History, RefreshCw, AlertCircle, Loader2, DollarSign,
  ChevronRight, ExternalLink, BarChart3
} from 'lucide-react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '../../components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Group {
  id: number;
  name: string;
  group_type: string;
  total_balance: string;
}

interface MpesaTransaction {
  id: number;
  transaction_id: string;
  transaction_type: string;
  transaction_type_display: string;
  amount: string;
  formatted_amount: string;
  phone_number: string;
  formatted_phone: string;
  account_reference: string;
  transaction_desc: string;
  status: string;
  status_display: string;
  mpesa_receipt_number: string;
  transaction_date: string | null;
  created_at: string;
  group_name: string | null;
  is_expired: boolean;
}

/**
 * M-Pesa Integration Page Component
 * Handles M-Pesa payment initiation and transaction history
 */
export function MPesaIntegrationPage() {
  const navigate = useNavigate();
  const { tab = 'pay' } = useParams<{ tab: string }>();
  
  // Payment form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [accountReference, setAccountReference] = useState('');
  const [transactionDesc, setTransactionDesc] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // User groups for dropdown
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  
  // Transactions history
  const [transactions, setTransactions] = useState<MpesaTransaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [transactionStats, setTransactionStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  });
  
  // Alerts
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  /**
   * Fetch user's groups on component mount
   */
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const response = await api.get('/groups/my-groups/');
        setGroups(response.data);
        
        // Set default group if available
        if (response.data.length > 0) {
          setSelectedGroup(response.data[0].id.toString());
          setAccountReference(`CONT${response.data[0].id.toString().padStart(3, '0')}`);
          setTransactionDesc(`Contribution to ${response.data[0].name}`);
        }
      } catch (err) {
        console.error('Failed to fetch groups:', err);
      } finally {
        setIsLoadingGroups(false);
      }
    };
    
    fetchGroups();
  }, []);
  
  /**
   * Fetch transaction history
   */
  const fetchTransactions = async () => {
    try {
      setIsLoadingTransactions(true);
      const response = await api.get('/mpesa/transactions/', {
        params: { page_size: 20, ordering: '-created_at' }
      });
      
      setTransactions(response.data.results || response.data);
      
      // Calculate stats
      if (response.data.results) {
        const stats = {
          total: response.data.count || 0,
          success: 0,
          pending: 0,
          failed: 0,
          totalAmount: 0
        };
        
        (response.data.results as MpesaTransaction[]).forEach(transaction => {
          stats.totalAmount += parseFloat(transaction.amount);
          if (transaction.status === 'SUCCESS') stats.success++;
          else if (transaction.status === 'PENDING') stats.pending++;
          else if (transaction.status === 'FAILED' || transaction.status === 'CANCELLED') stats.failed++;
        });
        
        setTransactionStats(stats);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };
  
  /**
   * Load transactions when tab changes to history
   */
  useEffect(() => {
    if (tab === 'history') {
      fetchTransactions();
    }
  }, [tab]);
  
  /**
   * Handle payment form submission
   * @param e - Form event
   */
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      const payload = {
        phone_number: phoneNumber,
        amount: parseFloat(amount),
        account_reference: accountReference,
        transaction_desc: transactionDesc,
        group_id: selectedGroup ? parseInt(selectedGroup) : undefined
      };
      
      const response = await api.post('/mpesa/transactions/initiate_stk_push/', payload);
      
      setSuccess(response.data.message || 'Payment initiated successfully!');
      
      // Reset form
      setAmount('');
      setPhoneNumber('');
      
      // Refresh transactions
      fetchTransactions();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          'Failed to initiate payment. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  /**
   * Check status of a specific transaction
   * @param transactionId - Transaction ID to check
   */
  const handleCheckStatus = async (transactionId: string) => {
    try {
      const response = await api.post(`/mpesa/transactions/${transactionId}/query_payment_status/`);
      setSuccess(response.data.message || 'Status updated successfully');
      fetchTransactions(); // Refresh list
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check status');
    }
  };
  
  /**
   * Get CSS classes for transaction status badge
   * @param status - Transaction status
   * @returns CSS class string
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <button 
            onClick={() => navigate('/finance')} 
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Finance
          </button>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">M-Pesa Payments</h1>
                <p className="text-muted-foreground">Make instant payments via Safaricom M-Pesa</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={fetchTransactions}
                disabled={isLoadingTransactions}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Alerts */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <h3 className="text-2xl font-bold">{transactionStats.total}</h3>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Successful</p>
                  <h3 className="text-2xl font-bold text-green-600">{transactionStats.success}</h3>
                </div>
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <h3 className="text-2xl font-bold text-yellow-600">{transactionStats.pending}</h3>
                </div>
                <Loader2 className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(transactionStats.totalAmount)}</h3>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="pay" value={tab} onValueChange={(value) => navigate(`/mpesa-integration/${value}`)}>
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="pay" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Make Payment
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Transaction History
            </TabsTrigger>
          </TabsList>
          
          {/* Payment Tab */}
          <TabsContent value="pay" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Initiate M-Pesa Payment</CardTitle>
                  <CardDescription>
                    Enter payment details to send an STK Push request to your phone
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePayment} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-muted-foreground">
                            +254
                          </span>
                          <Input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                            required
                            placeholder="712345678"
                            className="rounded-l-none"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter your Safaricom M-Pesa number
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount (KES) *</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
                            required
                            min="1"
                            max="150000"
                            step="0.01"
                            placeholder="1000.00"
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Maximum: KES 150,000 per transaction
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="group">Group (Optional)</Label>
                      <Select 
                        value={selectedGroup} 
                        onValueChange={setSelectedGroup}
                        disabled={isLoadingGroups}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name} ({group.group_type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Select a group to automatically create a contribution
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reference">Reference Number *</Label>
                      <Input
                        id="reference"
                        value={accountReference}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountReference(e.target.value)}
                        required
                        placeholder="CONT001, INVOICE123, etc."
                      />
                      <p className="text-xs text-muted-foreground">
                        This will appear on your M-Pesa statement
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={transactionDesc}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTransactionDesc(e.target.value)}
                        required
                        placeholder="Describe this payment"
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={isProcessing || !phoneNumber || !amount}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Initiating Payment...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Initiate M-Pesa Payment
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                  <CardDescription>Step-by-step guide</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium">Enter Payment Details</h4>
                        <p className="text-sm text-muted-foreground">
                          Fill in the form with phone number, amount, and description
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium">Initiate Payment</h4>
                        <p className="text-sm text-muted-foreground">
                          Click "Initiate M-Pesa Payment" to send STK Push
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium">Complete on Phone</h4>
                        <p className="text-sm text-muted-foreground">
                          Enter your M-Pesa PIN on the prompt on your phone
                        </p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium">Confirmation</h4>
                        <p className="text-sm text-muted-foreground">
                          You'll receive SMS confirmation and see the transaction here
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Notes</AlertTitle>
                    <AlertDescription className="text-xs">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Ensure you have sufficient M-Pesa balance</li>
                        <li>Transaction limit: KES 150,000 per transaction</li>
                        <li>STK Push expires after 10 minutes</li>
                        <li>You'll be charged KES 27.50 for transactions over KES 100</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View all your M-Pesa payment transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTransactions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading transactions...</span>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your M-Pesa payment transactions will appear here
                    </p>
                    <Button onClick={() => navigate('/mpesa-integration/pay')}>
                      Make Your First Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {transaction.transaction_desc}
                              </h4>
                              <Badge 
                                variant="outline" 
                                className={getStatusColor(transaction.status)}
                              >
                                {transaction.status_display}
                              </Badge>
                              {transaction.is_expired && transaction.status === 'PENDING' && (
                                <Badge variant="destructive">Expired</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {transaction.formatted_phone} • {transaction.account_reference}
                            </p>
                            {transaction.group_name && (
                              <p className="text-sm">
                                Group: <span className="font-medium">{transaction.group_name}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right">
                            <p className="text-lg font-bold">{transaction.formatted_amount}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm">
                            {transaction.mpesa_receipt_number && (
                              <p className="text-muted-foreground">
                                Receipt: <span className="font-medium">{transaction.mpesa_receipt_number}</span>
                              </p>
                            )}
                            <p className="text-muted-foreground">
                              ID: {transaction.transaction_id}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {transaction.status === 'PENDING' && !transaction.is_expired && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckStatus(transaction.transaction_id)}
                                className="flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" />
                                Check Status
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/transactions/mpesa-${transaction.id}`)}
                              className="flex items-center gap-1"
                            >
                              Details
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <div className="flex items-center justify-between w-full">
                  <p className="text-sm text-muted-foreground">
                    Showing {transactions.length} of {transactionStats.total} transactions
                  </p>
                  {transactions.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/transactions?type=mpesa')}
                      className="flex items-center gap-1"
                    >
                      View All Transactions
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
