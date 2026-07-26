import XCTest

@MainActor
final class RootstockUITests: XCTestCase {
    override func setUp() {
        super.setUp()
        continueAfterFailure = false
    }

    func testBundledAppSurvivesNetworkBlockedRestart() {
        let app = XCUIApplication()
        app.launch()
        assertOnboardingLoaded(in: app)
        app.terminate()

        app.launchEnvironment["ROOTSTOCK_DISABLE_NETWORK"] = "1"
        app.launch()
        assertOnboardingLoaded(in: app)

        let screenshot = XCTAttachment(screenshot: XCUIScreen.main.screenshot())
        screenshot.name = "Rootstock bundled-file startup with HTTP and HTTPS blocked"
        screenshot.lifetime = .keepAlways
        add(screenshot)

        app.terminate()
    }

    private func assertOnboardingLoaded(in app: XCUIApplication) {
        XCTAssertTrue(
            app.staticTexts["Words, by their roots."].waitForExistence(timeout: 30),
            "The bundled Rootstock onboarding screen did not render"
        )
        XCTAssertTrue(app.buttons["Continue"].exists)
    }
}
