'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Info } from 'lucide-react';

interface InheritanceField {
  label: string;
  value: string;
  override: boolean;
  customValue: string;
  onOverrideToggle: () => void;
  onCustomValueChange: (value: string) => void;
}

interface InheritanceCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: InheritanceField[];
  infoMessage?: string;
}

export default function InheritanceCard({
  title,
  subtitle,
  icon,
  fields,
  infoMessage,
}: InheritanceCardProps) {
  return (
    <Card className="p-6 mb-6 bg-white shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">{icon}</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      {infoMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-2" />
            {infoMessage}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">
                {field.label}
              </label>
              <button
                onClick={field.onOverrideToggle}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  field.override
                    ? 'bg-orange-100 text-orange-700 border border-orange-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {field.override ? 'Override 활성' : 'Override'}
              </button>
            </div>
            {field.override ? (
              <Input
                value={field.customValue}
                onChange={(e) => field.onCustomValueChange(e.target.value)}
                placeholder={`${field.label} 입력`}
                className="bg-orange-50 border-orange-300"
              />
            ) : (
              <Input
                value={field.value}
                readOnly
                className="bg-gray-50 text-gray-600"
              />
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
