import StoreKit
import UIKit

struct NativeEntitlement: Encodable {
    let active: Bool
    let plan: String?
    let trial: Bool
    let expiresAt: Double?
    let priceMonthly: String?
    let priceAnnual: String?
}

@MainActor
final class StoreKitService {
    static let monthlyID = "com.rootstock.full.monthly"
    static let annualID = "com.rootstock.full.annual"
    static let productIDs = [monthlyID, annualID]

    var onEntitlement: ((NativeEntitlement) -> Void)?

    private var products: [Product] = []
    private var updates: Task<Void, Never>?

    func start() {
        updates = Task { [weak self] in
            for await update in Transaction.updates {
                guard let self else { return }
                if case let .verified(transaction) = update {
                    await transaction.finish()
                }
                await refresh()
            }
        }
        Task { await refresh() }
    }

    func stop() {
        updates?.cancel()
        updates = nil
    }

    func refresh() async {
        do {
            products = try await Product.products(for: Self.productIDs)
        } catch {
            products = []
        }

        var activeTransaction: Transaction?
        for await result in Transaction.currentEntitlements {
            guard case let .verified(transaction) = result else { continue }
            guard Self.productIDs.contains(transaction.productID) else { continue }
            if transaction.revocationDate == nil,
               transaction.expirationDate.map({ $0 > Date() }) ?? true {
                if activeTransaction?.expirationDate ?? .distantPast < transaction.expirationDate ?? .distantFuture {
                    activeTransaction = transaction
                }
            }
        }

        let monthly = products.first { $0.id == Self.monthlyID }
        let annual = products.first { $0.id == Self.annualID }
        let transaction = activeTransaction
        let isTrial: Bool
        if #available(iOS 17.2, *) {
            isTrial = transaction?.offer?.type == .introductory
        } else {
            isTrial = transaction?.offerType == .introductory
        }
        let entitlement = NativeEntitlement(
            active: transaction != nil,
            plan: transaction.map { $0.productID == Self.annualID ? "annual" : "monthly" },
            trial: isTrial,
            expiresAt: transaction?.expirationDate.map { $0.timeIntervalSince1970 * 1000 },
            priceMonthly: monthly?.displayPrice,
            priceAnnual: annual?.displayPrice
        )
        onEntitlement?(entitlement)
    }

    func purchase(productID: String) async {
        if products.isEmpty {
            products = (try? await Product.products(for: Self.productIDs)) ?? []
        }
        guard let product = products.first(where: { $0.id == productID }) else {
            await refresh()
            return
        }
        do {
            let result = try await product.purchase()
            if case let .success(.verified(transaction)) = result {
                await transaction.finish()
            }
        } catch {
            // The web paywall remains visible and can retry or restore.
        }
        await refresh()
    }

    func restore() async {
        try? await AppStore.sync()
        await refresh()
    }

    func manageSubscriptions() async {
        guard let scene = UIApplication.shared.connectedScenes
            .compactMap({ $0 as? UIWindowScene })
            .first(where: { $0.activationState == .foregroundActive })
        else { return }
        try? await AppStore.showManageSubscriptions(in: scene)
    }
}
