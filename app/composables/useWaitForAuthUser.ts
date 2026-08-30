export const AUTH_USER_WAIT_TIMEOUT = 3000;

export function useWaitForAuthUser(): Promise<void> {
  const user = useSupabaseUser();

  if (user.value) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      stopWatching();
      resolve();
    };

    const timeout = setTimeout(finish, AUTH_USER_WAIT_TIMEOUT);
    const stopWatching = watch(user, (value) => {
      if (value) {
        finish();
      }
    });
  });
}
