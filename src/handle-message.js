const url = 'https://google.com/'

const messages = {
	start: 'მითხარი, ვინ ხარ შენ?',
	help: '/help - დახმარება\n\n/start - დაწყება\n\n/reset - თავიდან დაწყება',
	reset: ['ჰეჰ, თავიდან დაწყება გჭირდება?', 'კაი, დავიწყოთ', 'მითხარი, ვინ ხარ შენ?'],
	san_siro: ['რას ვიფიქრებდი, საკუთარი სახელის კარნახი თუ დაგჭირდებოდა...', 'Well...', { type: 'markdown', text: `[მიჰყევი ბმულს!](${url})` }],
	surprise: { type: 'surprise' },
	success: ['Wow! შთამბეჭდავია', 'გცოდნია, ვინ ხარ!', { type: 'markdown', text: `[მიჰყევი ბმულს!](${url})` }],
	error: ['მგონი ცდები', 'ჩემი წყაროები სხვაგვარად მეუბნებიან', 'არ მითხრა ახლა რომ არ იცი ვინ ხარ', 'რაღაც ადგილსაც ჰქვია იგივე სახელი?', 'კაი, დაფიქრდი ცოტა', 'წმინდა სირი?', 'სტადიონია მგონი...', 'მდაჰ'],
	errorDefault: 'ოღჩ... /san_siro დაწერე',
	mate: ['კაი გაჩერდი ახლა!'],
	mateDefault: 'ჩამოთვალე სხვა ყველა თუ გინდა, მაინც ცდები',
	question: 'კითხვებს აქ მე ვსვამ!',
};

const cache = {};

function isCorrect(text) {
	const regex = /san[\s\-_]?siro|სან[\s\-_]?სირო/gi;
	return !!(String(text).match(regex));
}

function isQuestion(text) {
	return String(text).includes('?');
}

function getCommand(text, entities) {
	if (entities && Array.isArray(entities)) {
		for (const entity of entities) {
			if (entity.type === 'bot_command') {
				return text.substr(entity.offset + 1, entity.length);
			}
		}
	}
	return null;
}

function isMate(text) {
	const names = [
		// full first
		'nikoloz', 'anna', 'ketevan', 'giorgi', 'tornike', 'nino', 'sandro', 'elene', 'alex', 'anano',
		'ნიკოლოზ', 'ანნა', 'ქეთევან', 'გიორგი', 'თორნიკე', 'ნინო', 'სანდრო', 'ელენე', 'ალექს', 'ანანო',
		// Nicknames
		'kolya', 'katie', 'gio', 'toko', 'elle',
		'კოლია', 'კაწი', 'გიო', 'თოკო', 'ელი',
		// Alternatives
		'klaus', 'ana', 'george', 'coach', 'volk', 'eleanor', 'ele', 'viki',
		'კლაუს', 'ანა', 'ჯორჯ', 'ვოლკ', 'ელეანორ', 'ელე', 'ვიკი'
	];
	return names.some(name => text.match(new RegExp(name, 'gi')));
}

function getRandomMessage(key) {
	let message = messages.key[key] || 'ჰმმ...';
	if (Array.isArray(message)) {
		message = messages[Math.floor(Math.random() * messages.length)];
	}
	return message;
}

module.exports = function({ user_id, first_name, text, entities }) {

	let command;
	if (command = getCommand(text, entities)) {
		switch (command) {
			case 'san_siro':
			case 'start':
			case 'reset':
				delete cache[user_id];
		}
		return messages[command] || messages.help;
	}

	if (isCorrect(text)) {
		delete cache[user_id];
		return messages.success;
	}

	if (isQuestion(text)) {
		return messages.question;
	}

	const cached = cache[user_id] = cache[user_id] || { tries: 0, mateTries: 0 };

	if (isMate(text)) {
		return messages.mate[cached.mateTries++] || messages.mateDefault;
	}

	return messages.error[cached.tries++] || messages.errorDefault;

};