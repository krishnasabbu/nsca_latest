import { User, Batch, Content, Attendance, YoyoTestResult, Analytics, FeeRecord, SmsMessage, Work, Investment } from '../types';
import { cacheManager } from './cache';

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbyQW57SJ8lUQBLUiYrArPWO0pryjWSiBC63DamcSYOdtenAk1aCeYbKXewlDDo7Q-CXxg/exec';

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({ error: 'Network error' }));

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

const fetchWithCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  useCache: boolean = true
): Promise<T> => {
  if (useCache) {
    const cached = await cacheManager.get<T>('cache', cacheKey);
    if (cached) {
      return cached;
    }
  }

  const data = await fetchFn();
  await cacheManager.set('cache', cacheKey, data);
  return data;
};

export const api = {
  cache: {
    clearAll: async () => {
      await cacheManager.clearAll();
    },
    getLastSyncTime: async (store: string) => {
      return cacheManager.getLastSyncTime(store);
    },
  },

  auth: {
    login: async (phone: string, password: string): Promise<User> => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'login', phone, password }),
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    changePassword: async (id: string, newPassword: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'changePassword', id, newPassword }),
        redirect: 'follow',
      });
      return handleResponse(response);
    },
  },

  users: {
    list: async (forceSync: boolean = false): Promise<User[]> => {
      return fetchWithCache(
        'users_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listUsers`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('users');
          return data;
        },
        !forceSync
      );
    },

    get: async (id: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}?action=getUser&id=${id}`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    create: async (userData: Partial<User>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createUser', ...userData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'users_list');
      return result;
    },

    upsert: async (userData: Partial<User>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'upsertUser', ...userData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'users_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteUser', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'users_list');
      return result;
    },

    getCoaches: async (forceSync: boolean = false): Promise<User[]> => {
      return fetchWithCache(
        'coaches_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=getCoaches`, {
            redirect: 'follow',
          });
          return handleResponse(response);
        },
        !forceSync
      );
    },

    getCoachStudents: async (coachId: string, forceSync: boolean = false): Promise<User[]> => {
      return fetchWithCache(
        `coach_students_${coachId}`,
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=getCoachStudents&coachId=${coachId}`, {
            redirect: 'follow',
          });
          return handleResponse(response);
        },
        !forceSync
      );
    },
  },

  batches: {
    list: async (forceSync: boolean = false): Promise<Batch[]> => {
      return fetchWithCache(
        'batches_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listBatches`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('batches');
          return data;
        },
        !forceSync
      );
    },

    create: async (batchData: Partial<Batch>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createBatch', ...batchData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'batches_list');
      return result;
    },

    update: async (batchData: Partial<Batch>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateBatch', ...batchData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'batches_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteBatch', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'batches_list');
      return result;
    },
  },

  content: {
    list: async (forceSync: boolean = false): Promise<Content[]> => {
      return fetchWithCache(
        'content_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listContent`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('content');
          return data;
        },
        !forceSync
      );
    },

    create: async (contentData: Partial<Content>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createContent', ...contentData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'content_list');
      return result;
    },

    update: async (contentData: Partial<Content>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateContent', ...contentData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'content_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteContent', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'content_list');
      return result;
    },
  },

  attendance: {
    list: async (forceSync: boolean = false): Promise<Attendance[]> => {
      return fetchWithCache(
        'attendance_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listAttendanceRecords`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('attendance');
          return data;
        },
        !forceSync
      );
    },

    create: async (attendanceData: Partial<Attendance>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createAttendanceRecord', ...attendanceData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'attendance_list');
      return result;
    },

    update: async (attendanceData: Partial<Attendance>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateAttendanceRecord', ...attendanceData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'attendance_list');
      return result;
    },

    markAttendance: async (attendanceData: Partial<Attendance>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'markAttendance', ...attendanceData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'attendance_list');
      return result;
    },
  },

  yoyoTest: {
    list: async (forceSync: boolean = false): Promise<YoyoTestResult[]> => {
      return fetchWithCache(
        'yoyotest_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listYoyoTestResults`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('yoyoTest');
          return data;
        },
        !forceSync
      );
    },

    create: async (testData: Partial<YoyoTestResult>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createYoyoTestResult', ...testData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'yoyotest_list');
      return result;
    },

    update: async (testData: Partial<YoyoTestResult>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateYoyoTestResult', ...testData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'yoyotest_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteYoyoTestResult', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'yoyotest_list');
      return result;
    },
  },

  analytics: {
    getOverview: async (forceSync: boolean = false): Promise<Analytics> => {
      return fetchWithCache(
        'analytics_overview',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=getAnalyticsOverview`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('analytics');
          return data;
        },
        !forceSync
      );
    },
  },

  fees: {
    list: async (forceSync: boolean = false): Promise<FeeRecord[]> => {
      return fetchWithCache(
        'fees_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listFees`, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('fees');
          return data;
        },
        !forceSync
      );
    },

    get: async (id: string): Promise<FeeRecord> => {
      const response = await fetch(`${API_BASE_URL}?action=getFee&id=${id}`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    listByUser: async (userid: string, forceSync: boolean = false): Promise<FeeRecord[]> => {
      return fetchWithCache(
        `fees_user_${userid}`,
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listFeesByUser&userid=${userid}`, {
            redirect: 'follow',
          });
          return handleResponse(response);
        },
        !forceSync
      );
    },

    filterByDate: async (startDate: string, endDate?: string): Promise<FeeRecord[]> => {
      let url = `${API_BASE_URL}?action=filterFeesByDate&startDate=${startDate}`;
      if (endDate) {
        url += `&endDate=${endDate}`;
      }
      const response = await fetch(url, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    create: async (feeData: Partial<FeeRecord>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createFee', ...feeData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'fees_list');
      return result;
    },

    update: async (feeData: Partial<FeeRecord>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateFee', ...feeData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'fees_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteFee', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'fees_list');
      return result;
    },
  },

  smsMessages: {
    list: async (forceSync: boolean = false, filters?: { limit?: number; type?: string; from?: string; to?: string }): Promise<SmsMessage[]> => {
      const cacheKey = filters ? `sms_messages_list_${JSON.stringify(filters)}` : 'sms_messages_list';

      return fetchWithCache(
        cacheKey,
        async () => {
          let url = `${API_BASE_URL}?action=listSmsTransactions`;

          if (filters) {
            if (filters.limit) url += `&limit=${filters.limit}`;
            if (filters.type) url += `&type=${filters.type}`;
            if (filters.from) url += `&from=${filters.from}`;
            if (filters.to) url += `&to=${filters.to}`;
          }

          const response = await fetch(url, {
            redirect: 'follow',
          });
          const data = await handleResponse(response);
          await cacheManager.setLastSyncTime('smsMessages');
          return data;
        },
        !forceSync
      );
    },

    get: async (id: string): Promise<SmsMessage> => {
      const response = await fetch(`${API_BASE_URL}?action=getSmsTransaction&id=${id}`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },
  },

  works: {
    list: async (forceSync: boolean = false): Promise<Work[]> => {
      return fetchWithCache(
        'works_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listWorks`, {
            redirect: 'follow',
          });
          const rawData = await handleResponse(response);
          const data = Array.isArray(rawData) ? rawData.map((item: any) => ({
            id: item.id,
            date: item.Date || item.date,
            workCategory: item['Work Category'] || item.workCategory,
            workDetails: item['Work Details'] || item.workDetails,
            paidBy: item['Paid By'] || item.paidBy,
            amount: item.Amount || item.amount,
            modeOfTransaction: item['Mode of Transaction'] || item.modeOfTransaction,
          })) : [];
          await cacheManager.setLastSyncTime('works');
          return data;
        },
        !forceSync
      );
    },

    get: async (id: string): Promise<Work> => {
      const response = await fetch(`${API_BASE_URL}?action=getWork&id=${id}`, {
        redirect: 'follow',
      });
      const rawData = await handleResponse(response);
      return {
        id: rawData.id,
        date: rawData.Date || rawData.date,
        workCategory: rawData['Work Category'] || rawData.workCategory,
        workDetails: rawData['Work Details'] || rawData.workDetails,
        paidBy: rawData['Paid By'] || rawData.paidBy,
        amount: rawData.Amount || rawData.amount,
        modeOfTransaction: rawData['Mode of Transaction'] || rawData.modeOfTransaction,
      };
    },

    create: async (workData: Partial<Work>) => {
      const payload = {
        action: 'createWork',
        date: workData.date,
        'Work Category': workData.workCategory,
        'Work Details': workData.workDetails,
        'Paid By': workData.paidBy,
        'Amount': workData.amount,
        'Mode of Transaction': workData.modeOfTransaction,
      };
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'works_list');
      return result;
    },

    upsert: async (workData: Partial<Work>) => {
      const payload = {
        action: 'upsertWork',
        id: workData.id,
        date: workData.date,
        'Work Category': workData.workCategory,
        'Work Details': workData.workDetails,
        'Paid By': workData.paidBy,
        'Amount': workData.amount,
        'Mode of Transaction': workData.modeOfTransaction,
      };
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'works_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteWork', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'works_list');
      return result;
    },
  },

  investments: {
    list: async (forceSync: boolean = false): Promise<Investment[]> => {
      return fetchWithCache(
        'investments_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listInvestments`, {
            redirect: 'follow',
          });
          const rawData = await handleResponse(response);
          const data = Array.isArray(rawData) ? rawData.map((item: any) => ({
            id: item.id,
            date: item.Date || item.date,
            name: item.Name || item.name,
            amount: item.Amount || item.amount,
          })) : [];
          await cacheManager.setLastSyncTime('investments');
          return data;
        },
        !forceSync
      );
    },

    get: async (id: string): Promise<Investment> => {
      const response = await fetch(`${API_BASE_URL}?action=getInvestment&id=${id}`, {
        redirect: 'follow',
      });
      const rawData = await handleResponse(response);
      return {
        id: rawData.id,
        date: rawData.Date || rawData.date,
        name: rawData.Name || rawData.name,
        amount: rawData.Amount || rawData.amount,
      };
    },

    create: async (investmentData: Partial<Investment>) => {
      const payload = {
        action: 'createInvestment',
        date: investmentData.date,
        'Name': investmentData.name,
        'Amount': investmentData.amount,
      };
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'investments_list');
      return result;
    },

    upsert: async (investmentData: Partial<Investment>) => {
      const payload = {
        action: 'upsertInvestment',
        id: investmentData.id,
        date: investmentData.date,
        'Name': investmentData.name,
        'Amount': investmentData.amount,
      };
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'investments_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteInvestment', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'investments_list');
      return result;
    },
  },
};
