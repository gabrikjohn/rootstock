import SwiftUI

@main
struct RootstockApp: App {
    var body: some Scene {
        WindowGroup {
            RootstockWebView()
                .ignoresSafeArea()
        }
    }
}
