'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Menu, Home, Users, FileText, Wrench, Settings, Plus, Search, Filter, MoreVertical, X } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  assignedOn: string;
  due: string;
  totalQuestions: number;
  totalMarks: number;
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Quiz on Electricity', assignedOn: '20-06-2025', due: '21-06-2025', totalQuestions: 10, totalMarks: 30 },
  { id: '2', title: 'Chapter 3 - Motion', assignedOn: '18-06-2025', due: '22-06-2025', totalQuestions: 8, totalMarks: 20 },
  { id: '3', title: 'Chemical Reactions Test', assignedOn: '15-06-2025', due: '20-06-2025', totalQuestions: 12, totalMarks: 40 },
  { id: '4', title: 'Algebra Mid-Term', assignedOn: '10-06-2025', due: '17-06-2025', totalQuestions: 15, totalMarks: 50 },
  { id: '5', title: 'History: World War II', assignedOn: '08-06-2025', due: '15-06-2025', totalQuestions: 10, totalMarks: 25 },
  { id: '6', title: 'English Grammar Quiz', assignedOn: '05-06-2025', due: '12-06-2025', totalQuestions: 20, totalMarks: 20 },
];

export default function HomePage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = assignments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    setOpenMenuId(null);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Assignment?</h3>
            <p className="text-sm text-gray-600 mb-5">This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex-shrink-0 relative">
          <div className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VedaAI</span>
            </div>
          </div>

          <div className="px-6 mb-6">
            <button
              onClick={() => router.push('/create')}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-full flex items-center justify-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Assignment</span>
            </button>
          </div>

          <nav className="px-6 space-y-1">
            <a href="/" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Users className="w-5 h-5" />
              <span>My Groups</span>
            </a>
            <a href="/" className="flex items-center justify-between px-3 py-2 text-gray-900 bg-gray-100 rounded-lg font-medium">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span>Assignments</span>
              </div>
              <span className="bg-orange-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">{assignments.length}</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Wrench className="w-5 h-5" />
              <span>AI Teacher's Toolkit</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5" />
              <span>My Library</span>
            </a>
          </nav>

          <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
            <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mb-3">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">D</span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Delhi Public School</div>
                <div className="text-xs text-gray-500">Bokaro Steel City</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600 font-medium">Assignments</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span className="text-sm font-medium text-gray-900">John Doe</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Assignments</h2>
              <p className="text-gray-500 text-sm">Manage and create assignments for your classes</p>
            </div>

            {/* Search + Filter */}
            <div className="flex items-center justify-between mb-6">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition bg-white">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Filter By</span>
              </button>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-white text-sm"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5">
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No assignments found</p>
                <button
                  onClick={() => router.push('/create')}
                  className="mt-4 px-5 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition"
                >
                  Create your first assignment
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {filtered.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition cursor-pointer relative"
                    onClick={() => setOpenMenuId(null)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900 pr-2">{assignment.title}</h3>
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === assignment.id ? null : assignment.id);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>
                        {openMenuId === assignment.id && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44 z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/create'); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              View Assignment
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); router.push('/create'); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(assignment.id); setOpenMenuId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Assigned on:</span>
                        <span className="font-medium text-gray-800">{assignment.assignedOn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Due:</span>
                        <span className="font-medium text-gray-800">{assignment.due}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{assignment.totalQuestions} questions</span>
                      <span className="text-xs font-semibold text-gray-700">{assignment.totalMarks} marks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => router.push('/create')}
                className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-full flex items-center space-x-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment</span>
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* ── Mobile Layout ── */}
      <div className="lg:hidden">
        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">VedaAI</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <nav className="space-y-1">
                <a href="/" className="flex items-center space-x-3 px-3 py-2 text-gray-900 bg-gray-100 rounded-lg font-medium">
                  <FileText className="w-5 h-5" />
                  <span>Assignments</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Users className="w-5 h-5" />
                  <span>My Groups</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Wrench className="w-5 h-5" />
                  <span>AI Toolkit</span>
                </a>
                <a href="#" className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </a>
              </nav>
            </div>
          </div>
        )}

        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">VedaAI</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <button onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 pb-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
            <span className="text-sm text-gray-500">{filtered.length} total</span>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No assignments found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((assignment) => (
                <div key={assignment.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900 pr-2">{assignment.title}</h3>
                    <div className="relative flex-shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === assignment.id ? null : assignment.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {openMenuId === assignment.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-40 z-20">
                          <button
                            onClick={() => { router.push('/create'); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            View / Edit
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmId(assignment.id); setOpenMenuId(null); }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Assigned: {assignment.assignedOn}</span>
                    <span>Due: {assignment.due}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">{assignment.totalQuestions} questions</span>
                    <span className="text-xs font-semibold text-gray-700">{assignment.totalMarks} marks</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white z-30">
          <div className="flex items-center justify-around py-2">
            <a href="/" className="flex flex-col items-center py-2 px-3 text-white">
              <Home className="w-5 h-5 mb-1" />
              <span className="text-xs">Home</span>
            </a>
            <a href="/" className="flex flex-col items-center py-2 px-3 text-gray-400">
              <FileText className="w-5 h-5 mb-1" />
              <span className="text-xs">Assignments</span>
            </a>
            <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-400">
              <Wrench className="w-5 h-5 mb-1" />
              <span className="text-xs">AI Toolkit</span>
            </a>
            <a href="#" className="flex flex-col items-center py-2 px-3 text-gray-400">
              <Settings className="w-5 h-5 mb-1" />
              <span className="text-xs">Settings</span>
            </a>
          </div>
        </nav>

        {/* FAB */}
        <button
          onClick={() => router.push('/create')}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gray-900 rounded-full shadow-lg flex items-center justify-center z-30"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
