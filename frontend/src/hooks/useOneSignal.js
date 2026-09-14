import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const ONESIGNAL_APP_ID = "41952295-559a-4ac1-9431-36443a3195ee";

function isProductionDomain() {
  return typeof window !== "undefined" && window.location.hostname.endsWith("northendedu.com");
}

function initOneSignal() {
  return new Promise((resolve) => {
    if (!isProductionDomain() || typeof window === "undefined" || !window.OneSignalDeferred) {
      resolve(null);
      return;
    }

    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        const instance = await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          serviceWorkerPath: "/push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: {
            scope: "/push/onesignal/",
          },
        });
        resolve(instance || window.OneSignal || null);
      } catch (err) {
        if (err && /already initialized/i.test(err.message || "")) {
          resolve(window.OneSignal || null);
          return;
        }
        resolve(null);
      }
    });
  });
}

export function useOneSignal() {
  const { user } = useAuth();

  useEffect(() => {
    if (!isProductionDomain()) return;
    let onesignal = null;

    initOneSignal().then((os) => {
      onesignal = os;
      if (!os || !user) return;

      try {
        if (typeof os.User !== "undefined" && typeof os.User.addTags === "function") {
          const result = os.User.addTags({
            role: user.role || "user",
            user_id: String(user.id || ""),
            name: String(user.name || ""),
            email: String(user.email || ""),
          });

          if (result && typeof result.catch === "function") {
            result.catch(() => {});
          }
        }

        if (user.id && typeof os.login === "function") {
          const loginResult = os.login(String(user.id));

          if (loginResult && typeof loginResult.catch === "function") {
            loginResult.catch(() => {});
          }
        }
      } catch (_) {}
    }).catch(() => {});

    return () => {
      try {
        if (onesignal && user?.id && typeof onesignal.logout === "function") {
          const logoutResult = onesignal.logout();

          if (logoutResult && typeof logoutResult.catch === "function") {
            logoutResult.catch(() => {});
          }
        }
      } catch (_) {}
    };
  }, [user]);
}

export function useOneSignalPermission() {
  useEffect(() => {
    if (!isProductionDomain() || typeof window === "undefined" || !window.OneSignalDeferred) return;

    window.OneSignalDeferred.push(async function (OneSignal) {
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          serviceWorkerPath: "/push/onesignal/OneSignalSDKWorker.js",
          serviceWorkerParam: {
            scope: "/push/onesignal/",
          },
        });
        await OneSignal.showNativePrompt();
      } catch (_) {}
    });
  }, []);
}
