const header = document.querySelector("[data-header]");

const PAYMENT_NOTIFY_API =
  "https://space-reset-payment-notify.ikit178.workers.dev/payments/cn/claim";

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
  const confirmationForm = paymentSelector.querySelector("[data-payment-confirmation]");
  const confirmationSubmit = paymentSelector.querySelector("[data-payment-submit]");
  const confirmationStatus = paymentSelector.querySelector("[data-payment-form-status]");

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

  const makeOrderId = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const random = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
    return `CN-SPACE-${date}-${time}-${random}`;
  };

  if (confirmationForm) {
    confirmationForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!confirmationForm.reportValidity()) return;
      if (!selectedMethod) {
        confirmationStatus.textContent = "请先选择微信支付或支付宝。";
        return;
      }

      const screenshot = confirmationForm.elements.screenshot.files[0];
      if (!screenshot) {
        confirmationStatus.textContent = "请上传付款截图。";
        return;
      }
      if (screenshot.size > 5 * 1024 * 1024) {
        confirmationStatus.textContent = "付款截图超过 5MB，请裁切或压缩后再上传。";
        return;
      }

      const orderId = makeOrderId();
      const body = new FormData(confirmationForm);
      body.set("order_id", orderId);
      body.set("plan", selectedPlan);
      body.set("method", selectedMethod);

      confirmationSubmit.disabled = true;
      confirmationSubmit.textContent = "正在提交…";
      confirmationStatus.textContent = "正在提交订单资料与付款截图，请不要关闭页面。";

      try {
        const response = await fetch(PAYMENT_NOTIFY_API, { method: "POST", body });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) throw new Error(payload.error || "submit failed");

        confirmationForm.reset();
        confirmationStatus.textContent = `提交成功。订单编号：${payload.order_id}。请保存编号；我们会依实际入账核对，并由企业微信服务专员联系你。添加后请在同一对话发送空间资料。`;
        confirmationSubmit.textContent = "已提交付款核对";
      } catch (error) {
        confirmationStatus.textContent =
          "暂时无法提交，资料尚未送达。请不要重复支付，稍后再试或直接联系我们核对。";
        confirmationSubmit.disabled = false;
        confirmationSubmit.textContent = "已付款，重新提交核对";
      }
    });
  }

  renderPayment();
}
