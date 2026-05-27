'use client';

import { useState } from 'react';
import { StudentInfo } from '@/types';

export default function StudentInfoSection() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    rollNumber: '',
    section: ''
  });

  return (
    <div className="border-2 border-gray-300 rounded-lg p-6 mb-8 bg-white">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Student Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={studentInfo.name}
            onChange={(e) => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter your name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Roll Number</label>
          <input
            type="text"
            value={studentInfo.rollNumber}
            onChange={(e) => setStudentInfo(prev => ({ ...prev, rollNumber: e.target.value }))}
            placeholder="Enter roll number"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Section</label>
          <input
            type="text"
            value={studentInfo.section}
            onChange={(e) => setStudentInfo(prev => ({ ...prev, section: e.target.value }))}
            placeholder="Enter section"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>
    </div>
  );
}
