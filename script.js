const header = document.querySelector("[data-header]");

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const audienceTabs = document.querySelector("[data-audience-tabs]");

if (audienceTabs) {
  const tabButtons = audienceTabs.querySelectorAll("[data-audience-tab]");
  const tabPanels = audienceTabs.querySelectorAll("[data-audience-panel]");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.audienceTab;

      tabButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });

      tabPanels.forEach((panel) => {
        const isActive = panel.dataset.audiencePanel === target;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    });
  });
}

const paymentSelector = document.querySelector("[data-payment-selector]");

if (paymentSelector) {
  const paymentPlans = {
    home: {
      label: "住宅空间检测",
      amount: "¥588",
      qrs: {
        wechat: "./assets/wechat-home-588.jpeg",
        alipay: "./assets/alipay-home-588.jpeg",
      },
    },
    business: {
      label: "商业空间检测",
      amount: "¥888",
      qrs: {
        wechat: "./assets/wechat-business-888.jpeg",
        alipay: "./assets/alipay-business-888.jpeg",
      },
    },
  };

  const paymentMethods = {
    wechat: "微信支付",
    alipay: "支付宝",
  };

  const planButtons = paymentSelector.querySelectorAll("button[data-plan-select]");
  const methodButtons = paymentSelector.querySelectorAll("[data-payment-method]");
  const result = paymentSelector.querySelector("[data-payment-result]");
  const title = paymentSelector.querySelector("[data-payment-title]");
  const amount = paymentSelector.querySelector("[data-payment-amount]");
  const methodLabel = paymentSelector.querySelector("[data-payment-method-label]");
  const qr = paymentSelector.querySelector("[data-payment-qr]");

  let selectedPlan = "home";
  let selectedMethod = "";

  const renderPlan = () => {
    planButtons.forEach((button) => {
      const isActive = button.dataset.planSelect === selectedPlan;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  const renderPayment = () => {
    renderPlan();

    methodButtons.forEach((button) => {
      const isActive = button.dataset.paymentMethod === selectedMethod;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (!selectedMethod) {
      result.hidden = true;
      qr.removeAttribute("src");
      qr.alt = "";
      return;
    }

    const plan = paymentPlans[selectedPlan];
    const paymentName = paymentMethods[selectedMethod];
    title.textContent = plan.label;
    amount.textContent = plan.amount;
    methodLabel.textContent = `支付方式：${paymentName}`;
    qr.src = plan.qrs[selectedMethod];
    qr.alt = `${plan.label}${plan.amount}${paymentName}收款码`;
    result.hidden = false;
  };

  document.querySelectorAll("[data-plan-select]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      selectedPlan = trigger.dataset.planSelect;
      renderPayment();
    });
  });

  methodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedMethod = button.dataset.paymentMethod;
      renderPayment();
    });
  });

  renderPayment();
}
