export interface ProjectView {
    description: string;
    src: string;
}

export interface Project {
    id?: string;
    client: string;
    companyName: string;
    completedProfile: boolean;
    creationDate: Date | string;
    description: string;
    imageUrl: string;
    position: string;
    state: boolean;
    technologies: string[];
    title: string;
    views: ProjectView[];
}