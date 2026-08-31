import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { Case } from '../types';

function subscribe(
  name: string,
  update: (items: Array<{ id: string; data: DocumentData }>) => void,
): Unsubscribe {
  return onSnapshot(query(collection(db, name), orderBy('__name__'), limit(100)), (snapshot) =>
    update(snapshot.docs.map((item) => ({ id: item.id, data: item.data() }))),
  );
}
export const adminService = {
  subscribeCases: (update: (items: Array<{ id: string; data: DocumentData }>) => void) =>
    subscribe('cases', update),
  subscribeReports: (update: (items: Array<{ id: string; data: DocumentData }>) => void) =>
    subscribe('reports', update),
  subscribeStats: (update: (items: Array<{ id: string; data: DocumentData }>) => void) =>
    subscribe('matchStats', update),
  subscribePayments: (update: (items: Array<{ id: string; data: DocumentData }>) => void) =>
    subscribe('payments', update),
  subscribeConfig: (update: (items: Array<{ id: string; data: DocumentData }>) => void) =>
    subscribe('systemConfig', update),
  publishCase: (caseData: Case) => httpsCallable(functions, 'publishCase')({ caseId: caseData.id, caseData }),
  disableCase: (caseId: string) => httpsCallable(functions, 'disableCase')({ caseId }),
  updateConfig: (maintenance: boolean, phaseDurations: Record<string, number>) =>
    httpsCallable(functions, 'updateSystemConfig')({ maintenance, phaseDurations }),
};
