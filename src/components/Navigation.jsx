import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ClipboardList, BarChart3, Lightbulb, CheckCircle, ClipboardCheck } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/assessment',
      label: 'Assessment',
      icon: ClipboardList,
      description: 'Complete tribe assessment'
    },
    {
      path: '/results',
      label: 'Analysis',
      icon: BarChart3,
      description: 'View scores and analytics'
    },
    {
      path: '/recommendations',
      label: 'Recommendations',
      icon: Lightbulb,
      description: 'Get personalized insights'
    }
  ];

  const getStepStatus = (index) => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <header className="boi-nav sticky top-0 z-50 boi-animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Bank of Ireland Logo with Assessment Icon */}
          <div className="boi-nav-logo">
            <div className="boi-nav-logo-icon">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{color: 'var(--boi-blue)'}}>Tribe Assessment Survey</h1>
              <p className="text-sm" style={{color: 'var(--text-secondary)'}}>SFIA-aligned competency evaluation</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <button
                    className={`boi-nav-button ${isActive ? 'active' : ''}`}
                    title={item.description}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Progress indicator */}
        <div className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>Navigate through the assessment process</span>
            <div className="boi-nav-progress">
              {navItems.map((item, index) => {
                const status = getStepStatus(index);
                
                return (
                  <div key={item.path} className="flex items-center">
                    <div className={`boi-nav-progress-step ${status}`}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    {index < navItems.length - 1 && (
                      <div className={`boi-nav-progress-connector ${status === 'completed' ? 'completed' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;

