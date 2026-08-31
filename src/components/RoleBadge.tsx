import React from 'react';
import { Role } from '../types';
import { Shield, Eye, Lock, Users, Sparkles } from 'lucide-react';

interface RoleBadgeProps {
  role: Role;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md', showLabel = true }) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'CHOR':
        return {
          label: 'Chor',
          subtitle: 'The Thief',
          color: 'bg-red-950/80 text-red-400 border-red-500/50 shadow-red-950/50',
          icon: (
            <Sparkles className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
          ),
        };
      case 'POLICE':
        return {
          label: 'Police',
          subtitle: 'The Inspector',
          color: 'bg-blue-950/80 text-blue-400 border-blue-500/50 shadow-blue-950/50',
          icon: <Shield className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'INFORMER':
        return {
          label: 'Informer',
          subtitle: 'The Eyewitness',
          color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50 shadow-emerald-950/50',
          icon: <Eye className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'PROTECTOR':
        return {
          label: 'Protector',
          subtitle: 'The Guardian',
          color: 'bg-purple-950/80 text-purple-400 border-purple-500/50 shadow-purple-950/50',
          icon: <Lock className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
      case 'CITIZEN':
      default:
        return {
          label: 'Citizen',
          subtitle: 'Investigator',
          color: 'bg-slate-900 text-teal-400 border-teal-500/40 shadow-slate-950/50',
          icon: <Users className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />,
        };
    }
  };

  const config = getRoleConfig();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs sm:text-sm gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm sm:text-base gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium border shadow-sm ${config.color} ${sizeClasses[size]}`}
    >
      {config.icon}
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};
