import { User, Batch, Content, Attendance, YoyoTestResult, Analytics } from '../types';

const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbxcGtEsqgOBrBCCCxQqZYIFBYcJnCCth0U2CbTl1b3vvdhdKuS6tP3JtpKGh962cIOA/exec';

const handleResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({ error: 'Network error' }));

  if (!response.ok || data.error) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

export const api = {
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
    list: async (): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}?action=listUsers`, {
        redirect: 'follow',
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
    },

    getCoaches: async (): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}?action=getCoaches`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },

    getCoachStudents: async (coachId: string): Promise<User[]> => {
      const response = await fetch(`${API_BASE_URL}?action=getCoachStudents&coachId=${coachId}`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },
  },

  batches: {
    list: async (): Promise<Batch[]> => {
      const response = await fetch(`${API_BASE_URL}?action=listBatches`, {
        redirect: 'follow',
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
    },
  },

  content: {
    list: async (): Promise<Content[]> => {
      const response = await fetch(`${API_BASE_URL}?action=listContent`, {
        redirect: 'follow',
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
    },
  },

  attendance: {
    list: async (): Promise<Attendance[]> => {
      const response = await fetch(`${API_BASE_URL}?action=listAttendanceRecords`, {
        redirect: 'follow',
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
    },
  },

  yoyoTest: {
    list: async (): Promise<YoyoTestResult[]> => {
      const response = await fetch(`${API_BASE_URL}?action=listYoyoTestResults`, {
        redirect: 'follow',
      });
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
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
      return handleResponse(response);
    },
  },

  analytics: {
    getOverview: async (): Promise<Analytics> => {
      const response = await fetch(`${API_BASE_URL}?action=getAnalyticsOverview`, {
        redirect: 'follow',
      });
      return handleResponse(response);
    },
  },
};
