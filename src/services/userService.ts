import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserProfile, Rank } from '../types/game';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export const userService = {
  async signIn() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return this.initializeProfile(result.user);
  },

  async initializeProfile(user: User): Promise<UserProfile> {
    const userDoc = doc(db, 'users', user.uid);
    let snap;
    try {
      snap = await getDoc(userDoc);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    }

    if (snap?.exists()) {
      return snap.data() as UserProfile;
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      displayName: user.displayName || 'Guest',
      email: user.email || '',
      photoURL: user.photoURL || '',
      currency: 1000,
      xp: 0,
      rank: Rank.Bronze,
      rankPoints: 0,
      inventory: {
        cars: ['BMW_M5'],
        currentCar: 'BMW_M5',
        guns: ['pistol'],
        paints: ['#ffffff'],
        decals: [],
        upgrades: {}
      },
      stats: {
        totalWins: 0,
        totalKills: 0,
        matchesPlayed: 0,
        highestScore: 0
      },
      achievements: [],
      dailyChallengeStatus: {}
    };

    try {
      await setDoc(userDoc, newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
    return newProfile;
  },

  async updateStats(uid: string, statsDelta: Partial<UserProfile['stats']>, currencyDelta = 0, xpDelta = 0) {
    const userDoc = doc(db, 'users', uid);
    const update: any = {};
    
    if (currencyDelta) update.currency = increment(currencyDelta);
    if (xpDelta) update.xp = increment(xpDelta);
    
    for (const [key, val] of Object.entries(statsDelta)) {
      update[`stats.${key}`] = increment(val as number);
    }

    try {
      await updateDoc(userDoc, update);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateProfile(uid: string, profileUpdate: Partial<UserProfile>) {
    const userDoc = doc(db, 'users', uid);
    try {
      await updateDoc(userDoc, profileUpdate);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
    }
  }
};
