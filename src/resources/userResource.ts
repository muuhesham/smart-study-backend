export class UserResource {
    id: string;
    name: string;
    email: string;

    constructor(user: any) {
        this.id = user._id.toString();
        this.name = user.name;
        this.email = user.email;
    }

}

export class ProfileResource {
  id: string;
  name: string;
  email: string;
  dailyStudyHours: number;

  constructor(user: any) {
    this.id = user._id.toString();
    this.name = user.name;
    this.email = user.email;
    this.dailyStudyHours = user.dailyStudyHours;
  }
}