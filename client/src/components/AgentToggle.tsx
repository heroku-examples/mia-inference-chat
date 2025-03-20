import React from 'react';
import clsx from 'clsx';
import type { Agent } from '@/types/chat';

interface AgentToggleProps {
  agent: Agent;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

export const AgentToggle: React.FC<AgentToggleProps> = ({
  agent,
  isSelected,
  onToggle,
  disabled,
}) => {
  const Icon = agent.icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={clsx(
        'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors',
        'border hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-heroku-purple',
        isSelected
          ? 'border-heroku-purple bg-heroku-purple/10 text-heroku-purple'
          : 'border-gray-300 text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {agent.name}
    </button>
  );
};
