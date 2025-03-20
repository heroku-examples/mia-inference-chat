export type AgentType =
  | 'web_search'
  | 'web_browsing'
  | 'code_exec_python'
  | 'code_exec_javascript'
  | 'code_exec_ruby'
  | 'code_exec_go';

export type Agent = {
  id: AgentType;
  name: string;
  icon: React.ElementType;
};
