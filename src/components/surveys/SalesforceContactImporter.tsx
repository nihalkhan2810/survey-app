'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Building, 
  Check, 
  X, 
  ChevronDown,
  ChevronUp,
  Download,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

interface SalesforceContact {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  name: string;
  company: string;
  title: string;
  department: string;
  source: string;
  salesforceId: string;
}

interface SalesforceContactImporterProps {
  onContactsSelected: (contacts: SalesforceContact[]) => void;
  onClose: () => void;
  enableVoiceReminders?: boolean;
}

export function SalesforceContactImporter({ 
  onContactsSelected, 
  onClose, 
  enableVoiceReminders = false 
}: SalesforceContactImporterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [contacts, setContacts] = useState<SalesforceContact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [needsAuth, setNeedsAuth] = useState(false);

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async (search: string = '') => {
    setLoading(true);
    setError(null);
    setNeedsAuth(false);
    
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      params.append('limit', '100');

      const response = await fetch(`/api/salesforce/contacts?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        // Check if it's an authentication error
        if (data.needsAuth || (data.error && (data.error.includes('Unauthorized') || data.error.includes('invalid') || data.error.includes('expired') || data.error.includes('authentication required')))) {
          setNeedsAuth(true);
          setError('Salesforce authentication required. Please click "Authenticate with Salesforce" below.');
          return;
        }
        throw new Error(data.error || 'Failed to load contacts from Salesforce');
      }

      setContacts(data.contacts || []);
    } catch (err) {
      console.error('Failed to load Salesforce contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthAuthentication = async () => {
    try {
      const response = await fetch('/api/salesforce/oauth-init');
      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth flow in new window
        const authWindow = window.open(data.authUrl, 'salesforce-auth', 'width=600,height=700');
        
        // Listen for the window to close (successful auth)
        const checkClosed = setInterval(() => {
          if (authWindow?.closed) {
            clearInterval(checkClosed);
            // Retry loading contacts after auth
            setTimeout(() => {
              loadContacts();
            }, 1000);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('OAuth init failed:', err);
      setError('Failed to initialize Salesforce authentication');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadContacts(searchTerm);
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const toggleExpanded = (contactId: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(contactId)) {
      newExpanded.delete(contactId);
    } else {
      newExpanded.add(contactId);
    }
    setExpanded(newExpanded);
  };

  const selectAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map(c => c.id)));
    }
  };

  const handleImport = () => {
    const selectedContactsList = contacts.filter(contact => 
      selectedContacts.has(contact.id)
    );

    // If voice reminders are enabled, filter contacts that have phone numbers
    if (enableVoiceReminders) {
      const contactsWithPhone = selectedContactsList.filter(contact => 
        contact.phone && contact.phone.trim() !== ''
      );
      
      if (contactsWithPhone.length !== selectedContactsList.length) {
        const message = `Note: ${selectedContactsList.length - contactsWithPhone.length} contacts were excluded because they don't have phone numbers (required for voice reminders).`;
        alert(message);
      }
      
      onContactsSelected(contactsWithPhone);
    } else {
      onContactsSelected(selectedContactsList);
    }
  };

  // Filter contacts that are compatible with voice reminders
  const getFilteredContacts = () => {
    if (enableVoiceReminders) {
      return contacts.filter(contact => contact.phone && contact.phone.trim() !== '');
    }
    return contacts;
  };

  const filteredContacts = getFilteredContacts();
  const contactsWithoutPhone = enableVoiceReminders ? contacts.length - filteredContacts.length : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="h-6 w-6" />
                Import from Salesforce
              </h2>
              <p className="mt-1 opacity-90">
                Select contacts to import {enableVoiceReminders && '(only contacts with phone numbers)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts by name, email, or company..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Voice reminder warning */}
          {enableVoiceReminders && contactsWithoutPhone > 0 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  {contactsWithoutPhone} contacts hidden (no phone number for voice reminders)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contact List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertTriangle className="h-5 w-5" />
                <div className="flex-1">
                  <p className="font-medium">Connection Error</p>
                  <p className="text-sm mt-1">{error}</p>
                  {needsAuth && (
                    <button
                      onClick={handleOAuthAuthentication}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Authenticate with Salesforce
                    </button>
                  )}
                  {!needsAuth && (
                    <p className="text-xs mt-2 opacity-75">
                      Please check your Salesforce credentials in the environment configuration.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading contacts from Salesforce...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                {error ? 'Unable to load contacts' : 'No contacts found'}
              </p>
              {searchTerm && !error && (
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedContacts.size === filteredContacts.length && filteredContacts.length > 0}
                    onChange={selectAll}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="font-medium">
                    Select All ({filteredContacts.length} contacts)
                  </span>
                </label>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedContacts.size} selected
                </span>
              </div>

              {/* Contact Cards */}
              <div className="space-y-3">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border rounded-lg p-4 transition-all cursor-pointer ${
                      selectedContacts.has(contact.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => toggleContactSelection(contact.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(contact.id)}
                          onChange={() => toggleContactSelection(contact.id)}
                          className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {contact.name}
                            </h3>
                            {contact.phone && (
                              <Phone className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {contact.email}
                            </div>
                            {contact.company && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {contact.company}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(contact.id);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                      >
                        {expanded.has(contact.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expanded.has(contact.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {contact.phone && (
                              <div>
                                <span className="font-medium">Phone:</span>
                                <span className="ml-2">{contact.phone}</span>
                              </div>
                            )}
                            {contact.title && (
                              <div>
                                <span className="font-medium">Title:</span>
                                <span className="ml-2">{contact.title}</span>
                              </div>
                            )}
                            {contact.department && (
                              <div>
                                <span className="font-medium">Department:</span>
                                <span className="ml-2">{contact.department}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Salesforce ID:</span>
                              <span className="ml-2 font-mono text-xs">{contact.salesforceId}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedContacts.size} of {filteredContacts.length} contacts selected
              {enableVoiceReminders && (
                <span className="block mt-1">
                  ✓ All selected contacts have phone numbers for voice reminders
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedContacts.size === 0}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Import {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}