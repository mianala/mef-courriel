import { LocalStorageService } from './../service/localstorage.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { User } from 'src/app/classes/user';
import { NotificationService } from 'src/app/services/notification.service';
import { Link } from '../classes/link';
import { AuthQueries } from '../queries/auth.queries';
import UserQueries from '../queries/user.queries';

class UserWithActions extends User {
  desactivate() {
    if (!confirm('Confirm to desactivate this user?')) {
      return;
    }
    UserService.getInstance().desactivateUser(this.id);
  }

  activate() {
    if (!confirm('Confirm to activate this user?')) {
      return;
    }
    UserService.getInstance().activateUser(this.id);
  }

  verify() {
    if (!confirm('Please confirm if you want to verify this user?')) {
      return;
    }
    UserService.getInstance().verifyUser(this.id);
  }

  updateRole() {
    const role = prompt(
      'LEAD:1, INTERIM:2, SECRETARY:3, MEMBER:4',
      this.role.toString() || '4'
    );

    if (!role || !User.RolesArray.includes(parseInt(role))) {
      return;
    }

    UserService.getInstance().updateUserRole(this.id, parseInt(role));
  }

  static mapActiveAndVerifiedUsers = map((users: UserWithActions[]) => {
    return users.filter((user) => user.active && user.verified);
  });

  static mapUnverifiedUsers = map((users: UserWithActions[]) => {
    return users.filter((user) => !user.verified && user.active);
  });

  static mapInactiveUsers = map((users: UserWithActions[]) => {
    return users.filter((user) => !user.active && user.verified);
  });

  static mapUsers = map((val: any): UserWithActions[] => {
    return val.data.user.map((val: any) => {
      return new UserWithActions(val);
    });
  });
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  static instance: UserService;

  static getInstance() {
    if (UserService.instance) {
      return UserService.instance;
    }

    return UserService.instance;
  }

  // save in cookie no sensitive data
  activeUser$: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(
    null
  );

  activeUserEntityId$ = this.activeUser$.pipe(
    filter((user) => !!user),
    map((user) => user!.entity.id),
    distinctUntilChanged()
  );

  activeUserId$ = this.activeUser$.pipe(
    filter((user) => !!user),
    map((user) => user!.id),
    distinctUntilChanged()
  );

  _activeUser: User | null = null;

  loggedIn$ = this.activeUser$.pipe(map((user) => (user ? true : false)));

  isAdmin$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role == 0 ? true : false) : false))
  );

  isLead$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role == 1 ? true : false) : false))
  );

  isinterim$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role == 2 ? true : false) : false))
  );

  isSecretary$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role == 3 ? true : false) : false))
  );

  isMember$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role == 4 ? true : false) : false))
  );

  // users with the role higher than member have access to inbox
  hasInboxAccess$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role <= 3 ? true : false) : false))
  );
  // users with the role higher than member have access to inbox
  hasDashboardAccess$ = this.activeUser$.pipe(
    map((user) => (user ? (user.role <= 2 ? true : false) : false))
  );

  usersQuery = this.getUsers();
  entityUsersQuery:
    | QueryRef<
        unknown,
        {
          entity_id: number;
        }
      >
    | undefined;
  unverifiedUsersQuery = this.getUnverifiedUsers();
  desactevatedUsersQuery = this.getInactiveUsers();
  activeAndVerifiedUsersQuery = this.getActiveAndVerifiedUsers();

  users$ = this.usersQuery.valueChanges.pipe(UserWithActions.mapUsers);
  entityUsers$: Observable<User[]> | undefined;
  // allUsers$ = this.usersQuery.valueChanges.pipe(UserWithActions.mapUsers);
  activeAndVerifiedUsers$ = this.activeAndVerifiedUsersQuery.valueChanges.pipe(
    UserWithActions.mapUsers
  );

  unverifiedUsers$ = this.unverifiedUsersQuery.valueChanges.pipe(
    UserWithActions.mapUsers
  );
  inactivatedUsers$ = this.desactevatedUsersQuery.valueChanges.pipe(
    UserWithActions.mapUsers
  );

  loggedOut$ = this.loggedIn$.pipe(
    distinctUntilChanged(),
    map((current) => !current)
  );

  constructor(
    private apollo: Apollo,
    private notification: NotificationService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    // FIXME: navigaor.online always true !!! This is just for localhost as, you won't be able to load the page without having internet right?
    if (!window.navigator.onLine) {
      this.notification.notify('Verifiez votre connexion Internet', 5000);
      return;
    }

    if (!UserService.instance) {
      UserService.instance = this;
    }

    const localStorageUser =
      localStorage.getItem('user') !== null
        ? this.localStorageService.getUser()
        : null; // redirect to login

    if (localStorageUser !== null) {
      console.log('active user from localstorage');
      this.activeUser$.next(localStorageUser!);
    }

    this.activeUser$.subscribe((user) => {
      if (!user) {
        return;
      }

      this._activeUser = user;
      this.entityUsersQuery = this.getEntityUsers(user!.entity_id);
      this.entityUsers$ = this.entityUsersQuery?.valueChanges.pipe(
        UserWithActions.mapUsers
      );
    });
  }

  saveNewUser(variables: any) {
    return this.apollo.mutate({
      mutation: UserQueries.SAVE_NEW,
      variables: variables,
    });
  }

  getUsers() {
    return this.apollo.watchQuery({
      query: UserQueries.USERS,
      fetchPolicy: 'cache-and-network',
    });
  }

  getAllUsers() {
    return this.apollo.watchQuery({
      query: UserQueries.USERS,
      fetchPolicy: 'cache-and-network',
    });
  }

  getUnverifiedUsers() {
    return this.apollo.watchQuery({
      query: UserQueries.UNVERIFIED,
      fetchPolicy: 'cache-and-network',
    });
  }

  getActiveAndVerifiedUsers() {
    return this.apollo.watchQuery({
      query: UserQueries.ACTIVE_AND_VERIFIED,
      fetchPolicy: 'cache-and-network',
    });
  }

  getInactiveUsers() {
    return this.apollo.watchQuery({
      query: UserQueries.INACTIVE,
      fetchPolicy: 'cache-and-network',
    });
  }

  getEntityUsers(entity_id: number) {
    return this.apollo.watchQuery({
      query: UserQueries.ENTITY_USERS,
      variables: {
        entity_id: entity_id,
      },
      fetchPolicy: 'cache-and-network',
    });
  }

  getMapEntityUsers(entity_id: number) {
    return this.apollo
      .watchQuery({
        query: UserQueries.ENTITY_USERS,
        variables: {
          entity_id: entity_id,
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(UserWithActions.mapUsers);
  }

  loginUserQuery(variables: { username: any; hashed: any }, next: () => void) {
    this.apollo
      .query({
        query: AuthQueries.LOGIN,
        variables: variables,
      })
      .pipe(UserWithActions.mapUsers)
      .subscribe((users) => {
        this.logInHandler(users);
        next();
      });
  }

  logInHandler(users: User[]) {
    // not registered
    if (users.length === 0) {
      this.notification.notify(
        "Vous n'??tes pas encore inscrit, veuillez vous inscrire",
        4000
      );

      return;
    }

    const user = users[0];

    // not activated
    if (!user.active) {
      this.notification.notify(
        "Votre compte a ??t?? d??sactiv??. Veuillez contacter l'assistance.",
        4000
      );
      return;
    }

    // not verified
    if (!user.verified) {
      this.notification.notify(
        'Votre compte doit ??tre v??rifi?? avant de pouvoir vous connecter.',
        4000
      );
      return;
    }

    this.activeUser$.next(user);

    this.updateUserLastLogin();
    this.localStorageService.setUser(user)
    localStorage.setItem('logged_in', new Date().toString());

    if (User.default_apps.includes(user.settings_default_app)) {
      this.router.navigate([user.settings_default_app]);
    } else {
      this.router.navigate([Link.FLOWS_INBOX]);
    }
  }

  logout() {
    this.activeUser$.next(null);
    localStorage.removeItem('user');

    this.notification.notify('Vous ??tes d??connect??');
  }

  updateUserLastLogin() {
    if (!this._activeUser) {
      return;
    }
    const set = { last_login: new Date() };
    this.updateUser(this._activeUser.id, set).subscribe((data) =>
      console.log('updated last login', data)
    );
  }

  updateUserRole(user_id: number, role: number) {
    if (!this._activeUser) {
      return;
    }
    const set = { role: role };
    this.updateUser(user_id, set).subscribe((data) => {
      this.notification.notify('Role Mis ?? jour');
      console.log('updated user role', data);
    });
  }

  updateDefaultApp(default_app: string) {
    if (!this._activeUser) {
      return;
    }
    const set = { settings_default_app: default_app };
    this.updateUser(this._activeUser.id, set).subscribe((data) =>
      this.notification.notify('Application par D??faut Mise ?? jour')
    );
  }

  resetPassword(hashed: string) {
    if (!this._activeUser) {
      return;
    }

    const set = { hashed: hashed };
    this.updateUser(this._activeUser.id, set).subscribe((data) =>
      console.log(data)
    );
  }

  transfer(user_id: number, entity_id: number) {
    const set = { entity_id: entity_id, verified: false };
    this.updateUser(user_id, set).subscribe((data) =>
      console.log('transfered user', data)
    );
  }

  verifyUser(user_id: number) {
    const set = { verified: true };
    this.updateUser(user_id, set).subscribe((data) =>
      this.notification.notify('Utilisateur verifi??')
    );
  }

  desactivateUser(user_id: number) {
    const set = { active: false };
    this.updateUser(user_id, set).subscribe((data) =>
      this.notification.notify('Utilisateur d??sactiv??')
    );
  }

  activateUser(user_id: number) {
    const set = { active: true };
    this.updateUser(user_id, set).subscribe((data) =>
      this.notification.notify('Utilisateur activ??')
    );
  }

  updateUser(user_id: number, set: any = {}, inc: any = {}) {
    const UPDATE_USER_MUTATION = gql`
      mutation update_user_mutation(
        $user_id: Int!
        $_set: user_set_input = {}
        $_inc: user_inc_input = {}
      ) {
        update_user(
          where: { id: { _eq: $user_id } }
          _set: $_set
          _inc: $_inc
        ) {
          affected_rows
          returning {
            id
          }
        }
      }
    `;

    return this.apollo.mutate({
      mutation: UserQueries.UPDATE,
      variables: {
        user_id: user_id,
        _set: set,
        _inc: inc,
      },
    });
  }
}
