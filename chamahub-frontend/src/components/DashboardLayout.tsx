import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Wallet,
  TrendingUp,
  PiggyBank,
  FileText,
  Vote,
  CheckSquare,
  BarChart3,
  FileBarChart,
  Shield,
  MessageSquare,
  Calendar,
  FolderOpen,
  Settings,
  UserCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  DollarSign,
  CreditCard,
  Receipt,
  Coins,
  Smartphone,
  LineChart,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Groups',
    items: [
      { name: 'My Groups', path: '/groups', icon: Users },
      { name: 'Create Group', path: '/groups/create', icon: Users },
    ],
  },
  {
    title: 'Finance',
    items: [
      { name: 'Finance Hub', path: '/finance', icon: Wallet },
      { name: 'Contributions', path: '/contributions', icon: DollarSign },
      { name: 'Transactions', path: '/transactions', icon: Receipt },
      { name: 'Expenses', path: '/expenses', icon: CreditCard },
      { name: 'Statements', path: '/statements', icon: FileText },
    ],
  },
  {
    title: 'Loans & Investments',
    items: [
      { name: 'Loans', path: '/loans', icon: Coins },
      { name: 'Apply for Loan', path: '/loans/apply', icon: FileText },
      { name: 'Investments', path: '/investments', icon: TrendingUp },
      { name: 'Portfolio', path: '/investments/portfolio', icon: PiggyBank },
      { name: 'Wealth Engine', path: '/wealth-engine', icon: LineChart },
    ],
  },
  {
    title: 'Governance & Tools',
    items: [
      { name: 'Voting', path: '/voting', icon: Vote },
      { name: 'Approvals', path: '/approvals', icon: CheckSquare },
      { name: 'Reports', path: '/reports', icon: FileBarChart },
      { name: 'M-Pesa Integration', path: '/mpesa-integration', icon: Smartphone },
    ],
  },
  {
    title: 'Collaboration',
    items: [
      { name: 'Chat', path: '/chat', icon: MessageSquare },
      { name: 'Meetings', path: '/meetings', icon: Calendar },
      { name: 'Documents', path: '/documents', icon: FolderOpen },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Profile', path: '/profile', icon: UserCircle },
      { name: 'Settings', path: '/settings', icon: Settings },
      { name: 'Two-Factor Auth', path: '/two-factor-auth', icon: Shield },
      { name: 'Audit Log', path: '/audit-log', icon: Shield },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(navigationSections.map((section) => section.title))
  );
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const Sidebar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`${
        isMobile ? 'w-full' : sidebarOpen ? 'w-64' : 'w-20'
      } bg-card border-r border-border flex flex-col transition-all duration-300`}
    >
      {/* Logo & Toggle */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {(sidebarOpen || isMobile) && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ChamaHub
          </h1>
        )}
        {!isMobile && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigationSections.map((section) => (
          <div key={section.title} className="space-y-2">
            {(sidebarOpen || isMobile) && (
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-2 py-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{section.title}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSections.has(section.title) ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>
            )}
            <AnimatePresence>
              {(expandedSections.has(section.title) || !sidebarOpen) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1"
                >
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => isMobile && setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'hover:bg-accent text-foreground'
                        } ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
                        title={!sidebarOpen && !isMobile ? item.name : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {(sidebarOpen || isMobile) && (
                          <span className="text-sm font-medium">{item.name}</span>
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-destructive hover:bg-destructive/10 transition-colors ${
            !sidebarOpen && !isMobile ? 'justify-center' : ''
          }`}
          title={!sidebarOpen && !isMobile ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(sidebarOpen || isMobile) && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen">
        <Sidebar />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-border bg-card p-4 flex items-center justify-between shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            ChamaHub
          </h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
