import { SiRuby, SiGo, SiNodedotjs, SiPython, SiHtml5, SiAdobeacrobatreader } from 'react-icons/si';
import type { Agent } from '@/types/chat';

export const AGENTS: Agent[] = [
  { id: 'html_to_markdown', name: 'HTML to Markdown', icon: SiHtml5 },
  { id: 'pdf_to_markdown', name: 'PDF to Markdown', icon: SiAdobeacrobatreader },
  { id: 'code_exec_python', name: 'Python', icon: SiPython },
  { id: 'code_exec_node', name: 'Node.js', icon: SiNodedotjs },
  { id: 'code_exec_ruby', name: 'Ruby', icon: SiRuby },
  { id: 'code_exec_go', name: 'Go', icon: SiGo },
];
