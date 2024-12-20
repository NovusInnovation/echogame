// pages/privacy.js
export default function PrivacyPage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-8">
			<h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
			<p className="mb-4">
				This Privacy Policy explains how we collect, use, and protect your data
				when you play our game <span className="font-bold">Echo</span>.
			</p>
			<h2 className="text-xl font-semibold mt-6 mb-4">What Data We Collect</h2>
			<ul className="list-disc pl-6 mb-4">
				<li>
					<strong>Name:</strong> Used for personalizing your experience.
				</li>
				<li>
					<strong>Email Address:</strong> Used for communication and
					account-related purposes.
				</li>
				<li>
					<strong>User ID:</strong> Used for identifying your account within our
					systems.
				</li>
				<li>
					<strong>Game Interactions:</strong> Used to improve and optimize
					gameplay and services.
				</li>
			</ul>
			<h2 className="text-xl font-semibold mt-6 mb-4">
				How We Protect Your Data
			</h2>
			<p className="mb-4">
				Your data is encrypted using industry-standard encryption methods to
				ensure it remains secure. We do not share your data with any third
				parties.
			</p>
			<h2 className="text-xl font-semibold mt-6 mb-4">Your Rights</h2>
			<p className="mb-4">
				You have the right to request access to your data, update it, or request
				its deletion. For any such requests, please contact us at{" "}
				<a
					href="mailto:contact@echo-game.com"
					className="text-blue-600 hover:underline"
				>
					contact@echo-game.com
				</a>
				.
			</p>
			<h2 className="text-xl font-semibold mt-6 mb-4">Contact Us</h2>
			<p>
				If you have any questions or concerns about this Privacy Policy, please
				reach out to us at
				<a
					href="mailto:contact@echo-game.com"
					className="text-blue-600 hover:underline"
				>
					{" "}
					contact@echo-game.com
				</a>
				.
			</p>
		</div>
	);
}
