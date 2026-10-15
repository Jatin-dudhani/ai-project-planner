export interface TechStackItem {
  category: string;
  items: string[];
}

export interface Route {
  path: string;
  description: string;
}

export interface DataModelEntity {
  name: string;
  fields: { name: string; type: string }[];
}

export interface BuildPhase {
  phase: string;
  tasks: string[];
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface ProjectBrief {
  projectName?: string;
  summary: string;
  targetUsers: string[];
  coreFeatures: string[];
  techStack: TechStackItem[];
  routes: Route[];
  dataModel: DataModelEntity[];
  buildPhases: BuildPhase[];
  risks: Risk[];
  starterPrompt: string;
}
