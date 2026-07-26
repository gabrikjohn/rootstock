import SafariServices
import SwiftUI
import WebKit

struct RootstockWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        configuration.userContentController.add(context.coordinator, name: "rootstock")

        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = false
        webView.backgroundColor = UIColor(red: 0.965, green: 0.957, blue: 0.929, alpha: 1)
        webView.accessibilityIdentifier = "rootstock.webview"
        context.coordinator.attach(webView)
        context.coordinator.loadBundledApp(
            blockingRemoteNetwork: ProcessInfo.processInfo.environment["ROOTSTOCK_DISABLE_NETWORK"] == "1"
        )
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {}

    static func dismantleUIView(_ webView: WKWebView, coordinator: Coordinator) {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "rootstock")
        coordinator.detach()
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        private weak var webView: WKWebView?
        private let store = StoreKitService()

        func attach(_ webView: WKWebView) {
            self.webView = webView
            store.onEntitlement = { [weak self] entitlement in
                self?.send(entitlement)
            }
            store.start()
        }

        func detach() {
            store.stop()
            webView = nil
        }

        func loadBundledApp(blockingRemoteNetwork: Bool = false) {
            if blockingRemoteNetwork {
                let rules = """
                [{
                  "trigger": {"url-filter": "^https?://"},
                  "action": {"type": "block"}
                }]
                """
                WKContentRuleListStore.default().compileContentRuleList(
                    forIdentifier: "RootstockOfflineAcceptance",
                    encodedContentRuleList: rules
                ) { [weak self] ruleList, error in
                    Task { @MainActor in
                        precondition(error == nil, "Could not install the offline acceptance rule")
                        if let ruleList {
                            self?.webView?.configuration.userContentController.add(ruleList)
                        }
                        self?.loadBundledFile()
                    }
                }
                return
            }
            loadBundledFile()
        }

        private func loadBundledFile() {
            guard
                let webRoot = Bundle.main.resourceURL?.appendingPathComponent("web", isDirectory: true),
                let index = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "web")
            else {
                assertionFailure("The generated dist artifact was not bundled as web/")
                return
            }
            webView?.loadFileURL(index, allowingReadAccessTo: webRoot)
        }

        func userContentController(
            _ userContentController: WKUserContentController,
            didReceive message: WKScriptMessage
        ) {
            guard
                message.name == "rootstock",
                let payload = message.body as? [String: Any],
                let action = payload["action"] as? String
            else { return }

            switch action {
            case "status":
                Task { await store.refresh() }
            case "purchase":
                guard let productID = payload["productId"] as? String else { return }
                Task { await store.purchase(productID: productID) }
            case "restore":
                Task { await store.restore() }
            case "manage":
                Task { await store.manageSubscriptions() }
            case "openURL":
                guard let value = payload["url"] as? String else { return }
                openURL(value)
            default:
                break
            }
        }

        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void
        ) {
            guard
                navigationAction.navigationType == .linkActivated,
                let url = navigationAction.request.url,
                let scheme = url.scheme?.lowercased(),
                scheme == "http" || scheme == "https"
            else {
                decisionHandler(.allow)
                return
            }
            decisionHandler(.cancel)
            present(SFSafariViewController(url: url))
        }

        private func send(_ entitlement: NativeEntitlement) {
            guard
                let data = try? JSONEncoder().encode(entitlement),
                let json = String(data: data, encoding: .utf8)
            else { return }
            webView?.evaluateJavaScript("window.RS_setEntitlement?.(\(json))")
        }

        private func openURL(_ value: String) {
            if let remote = URL(string: value), ["http", "https"].contains(remote.scheme?.lowercased() ?? "") {
                present(SFSafariViewController(url: remote))
                return
            }
            guard
                let root = Bundle.main.resourceURL?.appendingPathComponent("web", isDirectory: true),
                let local = URL(string: value, relativeTo: root)?.standardizedFileURL,
                local.path.hasPrefix(root.standardizedFileURL.path)
            else { return }
            let controller = LocalDocumentViewController(url: local, readAccess: root)
            present(UINavigationController(rootViewController: controller))
        }

        private func present(_ controller: UIViewController) {
            guard let presenter = webView?.window?.rootViewController else { return }
            var visible = presenter
            while let presented = visible.presentedViewController {
                visible = presented
            }
            visible.present(controller, animated: true)
        }
    }
}

@MainActor
private final class LocalDocumentViewController: UIViewController {
    private let url: URL
    private let readAccess: URL

    init(url: URL, readAccess: URL) {
        self.url = url
        self.readAccess = readAccess
        super.init(nibName: nil, bundle: nil)
        title = "Rootstock"
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        let webView = WKWebView(frame: .zero)
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)
        NSLayoutConstraint.activate([
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        navigationItem.leftBarButtonItem = UIBarButtonItem(
            barButtonSystemItem: .close,
            target: self,
            action: #selector(close)
        )
        webView.loadFileURL(url, allowingReadAccessTo: readAccess)
    }

    @objc private func close() {
        dismiss(animated: true)
    }
}
