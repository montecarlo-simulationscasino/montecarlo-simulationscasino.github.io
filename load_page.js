const dateFormat = Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormat = Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFormat = Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const load_page = () => {
  const info_container = () => {
    let nextDate = new Date("Apr 26, 2024 18:30:00");

    let maincontainer = document.createElement("div");
    maincontainer.classList.add("maincontainer");

    let title = document.createElement("h2");
    title.classList.add("centeredtext");
    title.innerHTML = "Casino Spieleabend";
    maincontainer.appendChild(title);

    let text = document.createElement("div");
    text.classList.add("textcontainer", "centeredtext");
    text.innerHTML = "Leider findet momentan kein Casino Spieleabend statt.<br>Der nächste Termin ist: ";
    maincontainer.appendChild(text);

    let displayDate = document.createElement("span");
    displayDate.classList.add("date");
    displayDate.id = "next-date";
    displayDate.innerHTML = dateTimeFormat.format(nextDate);
    text.appendChild(displayDate);

    let lineBreak = document.createElement("br");
    text.appendChild(lineBreak);

    let countdown = document.createElement("div");
    countdown.classList.add("countdown");
    countdown.id = "next-date-countdown-container";
    countdown.innerHTML = "loading countdown";
    text.appendChild(countdown);

    let placeholder = document.createElement("div");
    placeholder.classList.add("placeholder");
    maincontainer.appendChild(placeholder);

    document.body.appendChild(maincontainer);


    let countDownDate = nextDate.getTime();
    let countdownInterval = setInterval(function() {

      let now = new Date().getTime();
      let distance = countDownDate - now;
      let days = Math.floor(distance / (1000 * 60 * 60 * 24));
      let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      document.querySelector("#next-date-countdown-container").innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";

      if (distance <= 0) {
        clearInterval(countdownInterval);
        document.querySelector("#next-date-countdown-container").innerHTML = "jetzt";
      }
    }, 1000);
  };

  const generate_chart_data = (history) => {
    return new Promise((resolve, reject) => {
      let chart_data = [];
      for (let elem of history) {
        let dateObj = new Date(elem.time);
        let obj = {
          x: timeFormat.format(dateObj),
          y: elem.current_balance,
        };
        chart_data.push(obj);
      };
      return resolve(chart_data);
    });
  };

  const account_info = async (account) => {
    let reversed_account_history = account.history.slice(0).reverse();
    let overviewContainer = document.createElement("div");
    overviewContainer.classList.add("maincontainer");

    let overviewContainerTitle = document.createElement("h2");
    overviewContainerTitle.innerHTML = "Aktueller Kontostand:";
    overviewContainer.appendChild(overviewContainerTitle);

    let valueContainer = document.createElement("div");
    valueContainer.classList.add("account-value");
    let value = document.createElement("span");
    value.classList.add("value", (account.balance >= 0 ? "positive" : "negative"));
    value.innerHTML = account.balance;
    valueContainer.appendChild(value);
    overviewContainer.appendChild(valueContainer);

    let feedbackButton = document.createElement("button");
    feedbackButton.classList.add("action-button");
    feedbackButton.innerHTML = "Feedback senden";
    feedbackButton.addEventListener("click", () => {
      document.querySelector('#feedbackcontainer').classList.remove('slide-out');
      document.querySelector('#feedbackcontainer').classList.add('slide-in');
    });
    overviewContainer.appendChild(feedbackButton);

    let chipvalueButton = document.createElement("button");
    chipvalueButton.classList.add("action-button");
    chipvalueButton.innerHTML = "Chipwerte anzeigen";
    chipvalueButton.addEventListener("click", () => {
      document.querySelector('#chipvaluecontainer').classList.remove('slide-out');
      document.querySelector('#chipvaluecontainer').classList.add('slide-in');
    });
    overviewContainer.appendChild(chipvalueButton);


    let chartcontainer = document.createElement("div");
    chartcontainer.classList.add("maincontainer", "chartcontainer");
    let canvas = document.createElement("canvas");
    canvas.classList.add("account-chart");
    canvas.id = "accountChart";
    canvas.setAttribute("aria-label", "account chart");
    canvas.setAttribute("role", "img");
    canvas.innerHTML = "Your browser does not support the canvas element.";
    chartcontainer.appendChild(canvas);

    let chart_data = await generate_chart_data(account.history);
		Chart.defaults.backgroundColor = '#11161e';
		Chart.defaults.borderColor = '#676767';
		Chart.defaults.color = '#676767';

    new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [{
			    label: 'Kontostand',
          data: chart_data
        }]
      },
      options: {
        scales: {
				  x: {
				  	grid: {
				  		display: false
				  	}
				  },
          y: {
          	beginAtZero: true,
				  	title: {
				  		display: true,
				  		text: 'Kontostand \/ P\u210F\u0394'
				  	},
				  	grid: {
				  		color: '#373737'
				  	}
          }
        },
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += (context.parsed.y + ' P\u210F\u0394');
                }
                return label;
              }
            }
          }
				}
      }
    });


    let transactions = document.createElement("div");
    transactions.classList.add("maincontainer")

    let transactionsTitle = document.createElement("h2");
    transactionsTitle.innerHTML = "Kürzliche Transaktionen:";
    transactions.appendChild(transactionsTitle);

    let transactioncontainer = document.createElement("div");
    transactioncontainer.classList.add("transactionscontainer");
    transactions.appendChild(transactioncontainer);

    for (let transaction of reversed_account_history) {
      let container = document.createElement("div");
      container.classList.add("transaction");

      let t_meta = document.createElement("div");
      t_meta.classList.add("transaction-meta");
      container.appendChild(t_meta);

      let t_dateObj = new Date(transaction.time);

      let t_date = document.createElement("span");
      t_date.classList.add("transaction-date");
      t_date.innerHTML = dateFormat.format(t_dateObj);
      t_meta.appendChild(t_date);

      let lb_meta = document.createElement("br");
      t_meta.appendChild(lb_meta);

      let t_time = document.createElement("span");
      t_time.classList.add("transaction-time");
      t_time.innerHTML = timeFormat.format(t_dateObj);
      t_meta.appendChild(t_time);

      let t_name = document.createElement("div");
      t_name.classList.add("transaction-name");
      container.appendChild(t_name);

      let t_account = document.createElement("span");
      t_account.classList.add("transaction-account");
      t_account.innerHTML = transaction.account_name;
      t_name.appendChild(t_account);

      let lb_name = document.createElement("br");
      t_name.appendChild(lb_name);

      let t_subject = document.createElement("span");
      t_subject.classList.add("transaction-subject");
      t_subject.innerHTML = transaction.transaction_subject;
      t_name.appendChild(t_subject);

      let t_value = document.createElement("div");
      t_value.classList.add("transaction-value");
      container.appendChild(t_value);

      let value_span = document.createElement("span");
      value_span.classList.add("value", (transaction.transaction_value >= 0 ? "positive" : "negative"));
      value_span.innerHTML = transaction.transaction_value;
      t_value.appendChild(value_span);

      transactioncontainer.appendChild(container);
    };

    let margin = document.createElement("div");
    margin.classList.add("placeholder");
    transactions.appendChild(margin);


    document.body.appendChild(overviewContainer);
    document.body.appendChild(chartcontainer);
    document.body.appendChild(transactions);
  };

  const get_account = async () => {
    let loading_counter = 3;
    let elem = document.querySelector("#loading-points");
    let welcome = document.querySelector("#top-text");

    const animate = () => {
      if (loading_counter === 3) {
        elem.innerHTML = "...";
        loading_counter = 0;
      } else if (loading_counter === 2) {
        elem.innerHTML = "..";
        loading_counter++;
      } else if (loading_counter === 1) {
        elem.innerHTML = ".";
        loading_counter++;
      } else if (loading_counter === 0) {
        elem.innerHTML = "";
        loading_counter++;
      } else {
        console.error("loading_counter out of range");
      };
    };

    let loading_interval = setInterval(animate, 500);

    const urlParams = new URLSearchParams(window.location.search);
    const acid = urlParams.get('acid');
    if (acid) {
      try {
        const http_response = await fetch(`https://cashnet.montecarlo-card.de/api/v1/get_account/${acid}`);
        const api_json = await http_response.json();
        clearInterval(loading_interval);
        if (http_response.status === 200) {
          welcome.innerHTML = `Hallo, ${api_json.name}!`;
          account_info(api_json);
        } else {
          welcome.innerHTML = api_json.error;
        };
      } catch (error) {
        clearInterval(loading_interval);
        welcome.innerHTML = "connection error";
        console.error(error);
        info_container();
      };
    } else {
      console.error("acid not found in url parameters");
    };
  };

  get_account();
};

document.querySelector("#close-chip-container").addEventListener("click", () => {
  document.querySelector('#chipvaluecontainer').classList.remove('slide-in');
  document.querySelector('#chipvaluecontainer').classList.add('slide-out');
});

document.querySelector("#close-feedback-container").addEventListener("click", () => {
  document.querySelector('#feedbackcontainer').classList.remove('slide-in');
  document.querySelector('#feedbackcontainer').classList.add('slide-out');
});

/*document.querySelector("#copyButton").addEventListener("click", () => {
  let copyText = document.getElementById("evasysTAN");
  copyText.select();
  document.execCommand("copy");
});*/

window.addEventListener("load", load_page);