import { isEntitlementActive, type StoredEntitlement } from "../../domain/entitlement";
import type {
  Clock,
  EntitlementPort,
  StorageAdapter
} from "../../platform/contracts";
import type { Entitlement } from "../../types/state";

export type SubscriptionPlan = "annual" | "monthly";

interface EntitlementControllerOptions {
  storage: StorageAdapter;
  clock: Clock;
  port: EntitlementPort;
  devPreview: boolean;
  notify(message: string): void;
  onChange(): void;
}

const STORAGE_KEY = "rootstock_sub";
const TRIAL_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const PRODUCTS: Record<SubscriptionPlan, string> = {
  monthly: "com.rootstock.full.monthly",
  annual: "com.rootstock.full.annual"
};

export class EntitlementController {
  private readonly pricesByPlan: Record<SubscriptionPlan, string> = {
    monthly: "$4.99",
    annual: "$39.99"
  };

  private subscription: StoredEntitlement;

  constructor(private readonly options: EntitlementControllerOptions) {
    this.subscription = this.read();
    if (options.devPreview && !options.port.available() && this.subscription.source !== "native") {
      this.subscription = {
        source: "dev",
        active: true,
        plan: "annual",
        trial: false,
        startedAt: options.clock.now(),
        expiresAt: null
      };
      this.persist();
    }
    options.port.subscribe((entitlement) => this.setEntitlement(entitlement));
  }

  active(): boolean {
    return isEntitlementActive(this.subscription, this.options.clock.now());
  }

  hasNative(): boolean {
    return this.options.port.available();
  }

  inTrial(): boolean {
    return this.active() && this.subscription.trial === true;
  }

  trialDaysLeft(): number {
    if (!this.subscription.expiresAt) return 0;
    return Math.max(
      0,
      Math.ceil((this.subscription.expiresAt - this.options.clock.now()) / DAY_MS)
    );
  }

  planName(): string {
    if (this.subscription.plan === "annual") return "Annual";
    if (this.subscription.plan === "monthly") return "Monthly";
    return "";
  }

  prices(): Record<SubscriptionPlan, string> {
    return { ...this.pricesByPlan };
  }

  trialDays(): number {
    return TRIAL_DAYS;
  }

  requestStatus(): void {
    if (this.hasNative()) this.options.port.send({ action: "status" });
  }

  purchase(plan: SubscriptionPlan): void {
    if (this.hasNative()) {
      this.options.port.send({
        action: "purchase",
        plan,
        productId: PRODUCTS[plan]
      });
      this.options.notify("Contacting the App Store…");
      return;
    }
    const now = this.options.clock.now();
    this.subscription = {
      source: "dev",
      active: true,
      plan,
      trial: true,
      startedAt: now,
      expiresAt: now + TRIAL_DAYS * DAY_MS
    };
    this.persist();
    this.options.notify("Free trial started");
    this.options.onChange();
  }

  restore(): void {
    if (this.hasNative()) {
      this.options.port.send({ action: "restore" });
      this.options.notify("Restoring…");
      return;
    }
    this.options.notify(this.active() ? "Purchases restored" : "No purchases found");
  }

  manage(): void {
    if (this.hasNative()) {
      this.options.port.send({ action: "manage" });
      return;
    }
    this.openURL("https://apps.apple.com/account/subscriptions");
  }

  openURL(url: string): void {
    if (this.hasNative()) {
      this.options.port.send({ action: "openURL", url });
      return;
    }
    try {
      window.open(url, "_blank");
    } catch {
      window.location.href = url;
    }
  }

  private setEntitlement(entitlement: Entitlement): void {
    this.subscription = {
      source: "native",
      active: entitlement.active,
      plan: entitlement.plan ?? null,
      trial: entitlement.trial === true,
      expiresAt: entitlement.expiresAt ?? null
    };
    if (entitlement.priceMonthly) this.pricesByPlan.monthly = entitlement.priceMonthly;
    if (entitlement.priceAnnual) this.pricesByPlan.annual = entitlement.priceAnnual;
    this.persist();
    this.options.onChange();
  }

  private read(): StoredEntitlement {
    try {
      const raw = this.options.storage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as StoredEntitlement : { active: false };
    } catch {
      return { active: false };
    }
  }

  private persist(): void {
    try {
      this.options.storage.setItem(STORAGE_KEY, JSON.stringify(this.subscription));
    } catch {
      // Storage may be unavailable in a restricted preview; entitlement stays in memory.
    }
  }
}
