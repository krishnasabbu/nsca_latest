import { User, Batch, Content, Attendance, YoyoTestResult, Analytics, FeeRecord, SmsMessage } from '../types';
import { cacheManager } from './cache';

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxcGtEsqgOBrBCCCxQqZYIFBYcJnCCth0U2CbTl1b3vvdhdKuS6tP3JtpKGh962cIOA/exec';

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
    list: async (forceSync: boolean = false): Promise<SmsMessage[]> => {
      return fetchWithCache(
        'sms_messages_list',
        async () => {
          const response = await fetch(`${API_BASE_URL}?action=listSmsMessages`, {
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
      const response = await fetch(`${API_BASE_URL}?action=getSmsMessage&id=${id}`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    create: async (smsData: Partial<SmsMessage>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'createSmsMessage', ...smsData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'sms_messages_list');
      return result;
    },

    update: async (smsData: Partial<SmsMessage>) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'updateSmsMessage', ...smsData }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'sms_messages_list');
      return result;
    },

    delete: async (id: string) => {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ action: 'deleteSmsMessage', id }),
        redirect: 'follow',
      });
      const result = await handleResponse(response);
      await cacheManager.remove('cache', 'sms_messages_list');
      return result;
    },
  },
};
