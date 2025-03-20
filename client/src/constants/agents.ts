import { GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { SiRuby, SiGo, SiNodedotjs, SiPython } from 'react-icons/si';
import type { Agent } from '@/types/chat';

export const AGENTS: Agent[] = [
  { id: 'web_search', name: 'Web Search', icon: MagnifyingGlassIcon },
  { id: 'web_browsing', name: 'Web Browsing', icon: GlobeAltIcon },
  { id: 'code_exec_python', name: 'Python', icon: SiPython },
  { id: 'code_exec_javascript', name: 'JavaScript', icon: SiNodedotjs },
  { id: 'code_exec_ruby', name: 'Ruby', icon: SiRuby },
  { id: 'code_exec_go', name: 'Go', icon: SiGo },
];
