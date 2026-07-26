import StoreKit
import StoreKitTest
import XCTest
@testable import Rootstock

@MainActor
final class StoreKitServiceTests: XCTestCase {
    func testAnnualPurchaseAndExpirationPublishEntitlementChanges() async throws {
        let session = try await makeSession()
        defer { session.clearTransactions() }

        let service = StoreKitService()
        var latest: NativeEntitlement?
        service.onEntitlement = { latest = $0 }

        await service.refresh()
        XCTAssertEqual(latest?.active, false)
        XCTAssertEqual(latest?.priceMonthly, "$4.99")
        XCTAssertEqual(latest?.priceAnnual, "$39.99")

        await service.purchase(productID: StoreKitService.annualID)
        XCTAssertEqual(latest?.active, true)
        XCTAssertEqual(latest?.plan, "annual")
        XCTAssertEqual(latest?.trial, true)
        XCTAssertNotNil(latest?.expiresAt)
        XCTAssertEqual(session.allTransactions().count, 1)

        try session.expireSubscription(productIdentifier: StoreKitService.annualID)
        try await waitForInactive(service: service, latest: { latest })
        XCTAssertEqual(latest?.active, false)
        XCTAssertNil(latest?.plan)
    }

    func testMonthlyPurchaseRestoreAndRefundPublishEntitlementChanges() async throws {
        let session = try await makeSession()
        defer { session.clearTransactions() }

        let purchasingService = StoreKitService()
        var purchased: NativeEntitlement?
        purchasingService.onEntitlement = { purchased = $0 }
        await purchasingService.refresh()
        await purchasingService.purchase(productID: StoreKitService.monthlyID)

        XCTAssertEqual(purchased?.active, true)
        XCTAssertEqual(purchased?.plan, "monthly")
        XCTAssertEqual(purchased?.trial, true)
        XCTAssertEqual(purchased?.priceMonthly, "$4.99")
        XCTAssertEqual(purchased?.priceAnnual, "$39.99")

        let restoredService = StoreKitService()
        var restored: NativeEntitlement?
        restoredService.onEntitlement = { restored = $0 }
        await restoredService.restore()

        XCTAssertEqual(restored?.active, true)
        XCTAssertEqual(restored?.plan, "monthly")
        XCTAssertEqual(restored?.trial, true)

        let transaction = try XCTUnwrap(session.allTransactions().first)
        try session.refundTransaction(identifier: transaction.identifier)
        try await waitForInactive(service: restoredService, latest: { restored })
        XCTAssertEqual(restored?.active, false)
        XCTAssertNil(restored?.plan)
        XCTAssertEqual(restored?.trial, false)
    }

    private func makeSession() async throws -> SKTestSession {
        let configuration = try XCTUnwrap(
            Bundle(for: Self.self).url(forResource: "Rootstock", withExtension: "storekit")
        )
        let session = try SKTestSession(contentsOf: configuration)
        session.resetToDefaultState()
        session.clearTransactions()
        session.disableDialogs = true

        do {
            let products = try await Product.products(for: StoreKitService.productIDs)
            if products.count != StoreKitService.productIDs.count {
                try skipBrokenIOS26StoreKitRuntime(
                    "StoreKit Test returned \(products.count) of \(StoreKitService.productIDs.count) products"
                )
            }
        } catch {
            try skipBrokenIOS26StoreKitRuntime("StoreKit Test could not load products: \(error)")
        }
        return session
    }

    private func waitForInactive(
        service: StoreKitService,
        latest: () -> NativeEntitlement?
    ) async throws {
        let deadline = Date().addingTimeInterval(5)
        repeat {
            await service.refresh()
            if latest()?.active == false {
                return
            }
            try await Task.sleep(nanoseconds: 100_000_000)
        } while Date() < deadline
    }

    private func skipBrokenIOS26StoreKitRuntime(_ reason: String) throws {
        guard ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26 else {
            XCTFail(reason)
            return
        }
        throw XCTSkip(
            "\(reason). iOS 26 StoreKit Test currently fails to expose valid local products; "
                + "the same test remains mandatory on earlier runtimes and runs automatically when products load."
        )
    }
}
