import { Button, Card, Heading, Paragraph, Tag } from '@digdir/designsystemet-react'
import { useState, useEffect } from 'react'
import { PackagesView } from './components/PackagesView'
import { RolesView } from './components/RolesView'
import { OrganizationTypesView } from './components/OrganizationTypesView'
import { PackageSearchView } from './components/PackageSearchView'
import { ClientAdminDashboard } from './components/ClientAdminDashboard'

type View = 'home' | 'packages' | 'search' | 'roles' | 'types' | 'clientadmin';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    // Check authentication status on component mount
    checkAuthStatus();
    
    // Check for login/logout query params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
      setIsAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('logout') === 'success') {
      setIsAuthenticated(false);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (urlParams.get('error')) {
      console.error('Authentication error:', urlParams.get('error'), urlParams.get('error_description'));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/authentication/status');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Failed to check auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/authentication/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/authentication/logout';
  };

  const renderContent = () => {
    switch (currentView) {
      case 'packages':
        return <PackagesView />;
      case 'search':
        return <PackageSearchView />;
      case 'roles':
        return <RolesView />;
      case 'types':
        return <OrganizationTypesView />;
      case 'clientadmin':
        return <ClientAdminDashboard isAuthenticated={isAuthenticated} onLogin={handleLogin} />;
      default:
        return renderHomePage();
    }
  };

  const renderHomePage = () => (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E2B3C] to-[#2E4156] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Tag data-color="info" data-size="sm" className="mb-4">Reference Implementation</Tag>
          <Heading level={1} data-size="2xl" className="text-white mb-6">
            The Ultimate Access Management Tool
          </Heading>
          <Paragraph data-size="lg" className="text-gray-200 max-w-3xl mx-auto mb-8">
            Explore and showcase the Altinn Authorization API with this comprehensive reference implementation.
            Manage roles, delegations, consents, and system users with ease.
          </Paragraph>
          <div className="flex flex-wrap justify-center gap-4">
            <Button data-size="lg" onClick={() => setCurrentView('packages')}>
              Browse Packages
            </Button>
            <Button variant="secondary" data-size="lg" onClick={() => setCurrentView('roles')}>
              View Roles
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Access Section */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Heading level={2} data-size="lg" className="mb-6 text-center">
            Explore Metadata
          </Heading>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('packages')}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Access Packages</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Browse packages organized by area groups and areas.
              </Paragraph>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('search')}
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Search Packages</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Search for packages by name or description.
              </Paragraph>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('roles')}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Roles</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                View all available roles in the authorization system.
              </Paragraph>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('types')}
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Organization Types</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Browse organization subtypes and their configurations.
              </Paragraph>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-teal-200"
              onClick={() => setCurrentView('clientadmin')}
            >
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Client Admin</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Manage client delegations and agents for your organization.
              </Paragraph>
              <Tag data-color="success" data-size="sm" className="mt-2">New</Tag>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Heading level={2} data-size="xl" className="mb-4">
              Showcase Authorization API Features
            </Heading>
            <Paragraph className="text-gray-600 max-w-2xl mx-auto">
              This reference implementation demonstrates all major capabilities of the Altinn Authorization API.
            </Paragraph>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card data-color="neutral" className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Role Management</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                View and manage roles assigned to parties. Explore role definitions and assignments through the API.
              </Paragraph>
            </Card>

            <Card data-color="neutral" className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Delegations</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Create and manage delegations between parties. Handle both inbound and outbound delegation requests.
              </Paragraph>
            </Card>

            <Card data-color="neutral" className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Consents</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Manage consent requests and authorizations. Handle consent flows for data sharing between parties.
              </Paragraph>
            </Card>

            <Card data-color="neutral" className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">System Users</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Configure and manage system user integrations. Handle client connections and authentication flows.
              </Paragraph>
            </Card>

            <Card data-color="neutral" className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Access Control</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Implement fine-grained access control policies. Verify and authorize access to resources and actions.
              </Paragraph>
            </Card>

            <Card 
              data-color="neutral" 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentView('clientadmin')}
            >
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <Heading level={3} data-size="sm" className="mb-2">Client Admin</Heading>
              <Paragraph data-size="sm" className="text-gray-600">
                Manage client delegations and agents. View clients, add/remove agents, and manage access packages.
              </Paragraph>
            </Card>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section id="api" className="bg-gray-100 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Tag data-color="success" data-size="sm" className="mb-4">Altinn Authorization API</Tag>
              <Heading level={2} data-size="lg" className="mb-4">
                Built on Altinn 3 Platform
              </Heading>
              <Paragraph className="text-gray-600 mb-6">
                This reference implementation demonstrates best practices for integrating with the
                Altinn Authorization API. Explore real-world patterns for authentication, authorization,
                and access management.
              </Paragraph>
              <ul className="space-y-3">
                {['Role-based access control', 'Delegation workflows', 'Consent management', 'System user integration'].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#1E2B3C] rounded-lg p-6 text-sm font-mono text-gray-300 overflow-x-auto">
              <pre>{`// Example: Get roles for a party
const response = await fetch(
  '/api/metadata/roles',
  {
    headers: {
      'Content-Type': 'application/json'
    }
  }
);

const roles = await response.json();
console.log(roles);`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E2B3C] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="8" fill="#E23B53" />
                  <path d="M12 28L20 12L28 28H12Z" fill="white" />
                </svg>
                <span className="font-semibold">Altinn Access Manager</span>
              </div>
              <Paragraph data-size="sm" className="text-gray-400">
                A reference implementation showcasing the Altinn Authorization API.
              </Paragraph>
            </div>
            <div>
              <Heading level={4} data-size="xs" className="text-white mb-4">Resources</Heading>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="https://docs.altinn.studio" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="https://github.com/Altinn" className="hover:text-white transition-colors">GitHub</a></li>
                <li><a href="https://altinn.no" className="hover:text-white transition-colors">Altinn.no</a></li>
              </ul>
            </div>
            <div>
              <Heading level={4} data-size="xs" className="text-white mb-4">API</Heading>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Authorization API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Register API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Authentication API</a></li>
              </ul>
            </div>
            <div>
              <Heading level={4} data-size="xs" className="text-white mb-4">Community</Heading>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Slack</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Stack Overflow</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contributing</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Altinn Access Manager - Reference Implementation</p>
          </div>
        </div>
      </footer>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-color-scheme="light">
      {/* Header */}
      <header className="bg-[#1E2B3C] text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#E23B53" />
              <path d="M12 28L20 12L28 28H12Z" fill="white" />
            </svg>
            <span className="text-xl font-semibold">Altinn Access Manager</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setCurrentView('packages')} 
              className={`hover:text-gray-300 transition-colors ${currentView === 'packages' ? 'text-white font-semibold' : ''}`}
            >
              Packages
            </button>
            <button 
              onClick={() => setCurrentView('search')} 
              className={`hover:text-gray-300 transition-colors ${currentView === 'search' ? 'text-white font-semibold' : ''}`}
            >
              Search
            </button>
            <button 
              onClick={() => setCurrentView('roles')} 
              className={`hover:text-gray-300 transition-colors ${currentView === 'roles' ? 'text-white font-semibold' : ''}`}
            >
              Roles
            </button>
            <button 
              onClick={() => setCurrentView('types')} 
              className={`hover:text-gray-300 transition-colors ${currentView === 'types' ? 'text-white font-semibold' : ''}`}
            >
              Types
            </button>
            <button 
              onClick={() => setCurrentView('clientadmin')} 
              className={`hover:text-gray-300 transition-colors ${currentView === 'clientadmin' ? 'text-white font-semibold' : ''}`}
            >
              Client Admin
            </button>
            {!isLoading && (
              isAuthenticated ? (
                <Button variant="secondary" data-size="sm" onClick={handleLogout}>
                  Logg ut
                </Button>
              ) : (
                <Button data-size="sm" onClick={handleLogin}>
                  Logg inn med ID-porten
                </Button>
              )
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      {renderContent()}
    </div>
  )
}

export default App
