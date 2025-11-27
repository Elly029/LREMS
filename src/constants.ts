import { Book, Status } from './types';

export const INITIAL_BOOKS: Book[] = [];

export const STATUS_OPTIONS = Object.values(Status);

export const STATUS_STYLES: Record<Status, string> = {
  [Status.ForEvaluation]: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  [Status.ForRevision]: 'bg-orange-50 text-orange-700 border border-orange-200',
  [Status.ForROR]: 'bg-blue-50 text-blue-700 border border-blue-200',
  [Status.ForFinalization]: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  [Status.ForFRR]: 'bg-purple-50 text-purple-700 border border-purple-200',
  [Status.FinalRevisedCopy]: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  [Status.NotFound]: 'bg-red-50 text-red-700 border border-red-200',
  [Status.Returned]: 'bg-gray-100 text-gray-700 border border-gray-200',
  [Status.DqForReturn]: 'bg-slate-100 text-slate-700 border border-slate-200',
  [Status.InProgress]: 'bg-sky-50 text-sky-700 border border-sky-200',
};
