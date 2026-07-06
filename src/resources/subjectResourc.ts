export class SubjectResource {
  id: string;
  name: string;
  difficulty: number;
  examDate: string;
  icon: string;
  targetHoursPerWeek: number;
  topics: string[];

  constructor(subject: any) {
    this.id = subject._id.toString(); 
    this.name = subject.name;
    this.difficulty = subject.difficulty;
    this.examDate = subject.examDate;
    this.icon = subject.icon;
    this.targetHoursPerWeek = subject.targetHoursPerWeek;
    this.topics = subject.topics || [];
  }
}
