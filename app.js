// app.js

document.addEventListener("DOMContentLoaded", () => {
  const screenWelcome = document.getElementById("screen-welcome");
  const screenChat = document.getElementById("screen-chat");

  const profileForm = document.getElementById("profile-form");
  const profileSummaryEl = document.getElementById("profile-summary");

  const chatMessagesEl = document.getElementById("chat-messages");
  const chatForm = document.getElementById("chat-form");
  const chatInput = document.getElementById("chat-input");

  const modalOverlay = document.getElementById("modal-overlay");
  const modalTitle = document.getElementById("modal-title");
  const modalContent = document.getElementById("modal-content");
  const modalCloseBtn = document.getElementById("modal-close");

  const personalityTags = document.getElementById("personality-tags");
  const personalityHiddenInput = document.getElementById("dog-personality");

  // アプリ状態
  const state = {
    profile: null,
    messages: [] // { role: 'user' | 'assistant', content: string }
  };

  /* -------------------------
   * 性格タグの選択処理
   * ----------------------- */
  personalityTags.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "button") {
      // 一旦全部のactiveを外す
      Array.from(personalityTags.querySelectorAll("button")).forEach((btn) =>
        btn.classList.remove("active")
      );
      // クリックしたものだけactive
      e.target.classList.add("active");
      personalityHiddenInput.value = e.target.dataset.value || "";
    }
  });

  /* -------------------------
   * 画面切り替え
   * ----------------------- */
  function showScreen(name) {
    if (name === "welcome") {
      screenWelcome.classList.add("active");
      screenChat.classList.remove("active");
    } else if (name === "chat") {
      screenWelcome.classList.remove("active");
      screenChat.classList.add("active");
    }
  }

  /* -------------------------
   * プロフィールサマリ表示
   * ----------------------- */
  function renderProfileSummary() {
    if (!state.profile) return;

    const { dogName, dogBreed, dogAge, dogWeight, dogPersonality } = state.profile;

    const items = [];
    if (dogBreed) items.push(dogBreed);
    if (dogAge) items.push(`${dogAge}歳`);
    if (dogPersonality) items.push(dogPersonality);
    if (dogWeight) items.push(`${dogWeight}kg`);

    profileSummaryEl.innerHTML = `
      <span>${dogName ? dogName : "愛犬"}</span>
      ${items.map((t) => `<span>${t}</span>`).join("")}
    `;
  }

  /* -------------------------
   * メッセージ描画
   * ----------------------- */
  function appendMessage(role, content, withScroll = true, extraButtons = []) {
    const row = document.createElement("div");
    row.className = `message-row ${role === "user" ? "user" : "ai"}`;

    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${role === "user" ? "user" : "ai"}`;
    bubble.textContent = content;
    row.appendChild(bubble);

    if (role === "assistant" && extraButtons.length > 0) {
      const btnContainer = document.createElement("div");
      btnContainer.className = "section-buttons";

      extraButtons.forEach((btnInfo) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "section-button";
        btn.textContent = btnInfo.label;
        btn.addEventListener("click", () => {
          openDetailModal(btnInfo.type);
        });
        btnContainer.appendChild(btn);
      });

      row.appendChild(btnContainer);
    }

    chatMessagesEl.appendChild(row);

    if (withScroll) {
      chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
  }

  /* -------------------------
   * ローディング（AI思考中）
   * ----------------------- */
  function showThinking() {
    const row = document.createElement("div");
    row.className = "message-row ai";
    row.id = "thinking-row";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble ai";
    bubble.textContent = "考え中です…";
    row.appendChild(bubble);

    chatMessagesEl.appendChild(row);
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function hideThinking() {
    const row = document.getElementById("thinking-row");
    if (row) row.remove();
  }

  /* -------------------------
   * モーダルを開く（画面C）
   * type: 'care' | 'hotel' | 'fashion'
   * ----------------------- */
  function openDetailModal(type) {
    modalTitle.textContent =
      type === "care"
        ? "ケアの詳細候補"
        : type === "hotel"
        ? "おすすめホテル候補"
        : "ファッションのおすすめ";

    // 簡易ダミーデータ：本番はAIから構造化レスポンスをもらっても良い
    const dummyCards = {
      care: [
        {
          title: "夜のリラックスルーティン",
          text: "散歩後に5〜10分のスキンシップタイムを固定化し、安心できる時間をつくります。",
          meta: "目安時間：10〜15分 / コスト：0円"
        },
        {
          title: "週1回の“ごほうびデー”",
          text: "知育おもちゃ＋ヘルシーおやつで、日中の退屈を減らします。",
          meta: "月額目安：1,000〜3,000円"
        }
      ],
      hotel: [
        {
          title: "シティ型ペットホテル A",
          text: "駅近で24時間スタッフ在駐。慎重な性格の子向け個室あり。",
          meta: "1泊：8,000〜12,000円（東京23区内）"
        },
        {
          title: "郊外型お預かり B",
          text: "芝生ドッグラン付きで、日中たっぷり運動できるタイプ。",
          meta: "1泊：10,000〜15,000円（送迎オプションあり）"
        }
      ],
      fashion: [
        {
          title: "軽量ダウンベスト",
          text: "寒がりな子でも動きやすい、軽量・防水タイプのベスト。",
          meta: "価格帯：8,000〜12,000円"
        },
        {
          title: "撥水パーカー",
          text: "雨の日散歩でもテンションが下がりにくい、撥水素材のパーカー。",
          meta: "価格帯：6,000〜9,000円"
        }
      ]
    };

    const cards = dummyCards[type] || [];
    modalContent.innerHTML = "";

    cards.forEach((c) => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="card-title">${c.title}</div>
        <div class="card-text">${c.text}</div>
        <div class="card-meta">${c.meta}</div>
        <button class="card-button" type="button">詳細ページへ</button>
      `;

      modalContent.appendChild(card);
    });

    modalOverlay.classList.remove("hidden");
  }

  function closeDetailModal() {
    modalOverlay.classList.add("hidden");
  }

  modalCloseBtn.addEventListener("click", closeDetailModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeDetailModal();
    }
  });

  /* -------------------------
   * ChatGPT API呼び出し（バックエンド想定）
   * ----------------------- */
  async function callChatAPI(userMessage) {
    // state.messages を含めてAPIに渡す
    const payload = {
      profile: state.profile,
      messages: [...state.messages, { role: "user", content: userMessage }]
    };

    try {
      // ここを自分のバックエンドAPIに変更する
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("API Error");
      }

      const data = await res.json();
      // 返却形式はバックエンド次第だが、ここでは { reply: "テキスト" } を想定
      return data.reply || "うまく返答を取得できませんでした。";
    } catch (e) {
      console.error(e);
      // バックエンド未実装でもとりあえず動くように、ダミー返答
      return (
        "（PAPICO AI）\n\n" +
        "ケア提案：\n- 留守がちな日には知育おもちゃ＋おやつで退屈を減らしましょう。\n\n" +
        "ホテル提案：\n- 慎重な性格の子には、個室タイプでスタッフ常駐のホテルがおすすめです。\n\n" +
        "ファッション提案：\n- 散歩の頻度や季節に合わせて、軽めのアウターから揃えていきましょう。"
      );
    }
  }

  /* -------------------------
   * プロフィールフォーム送信
   * ----------------------- */
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(profileForm);
    const profile = {
      dogName: formData.get("dogName")?.toString().trim(),
      dogBreed: formData.get("dogBreed")?.toString().trim(),
      dogAge: formData.get("dogAge")?.toString().trim(),
      dogWeight: formData.get("dogWeight")?.toString().trim(),
      dogPersonality: formData.get("dogPersonality")?.toString().trim(),
      livingEnv: formData.get("livingEnv")?.toString().trim(),
      category: formData.get("category")?.toString(),
      firstQuestion: formData.get("firstQuestion")?.toString().trim()
    };

    state.profile = profile;
    state.messages = [];

    // プロフィールサマリ表示
    renderProfileSummary();

    // 画面切り替え
    showScreen("chat");

    // 初期ユーザーメッセージを組み立て
    const introMessage =
      (profile.firstQuestion && profile.firstQuestion.length > 0
        ? profile.firstQuestion
        : "うちの子に合うケア・ペットホテル・ファッションについて教えてください。") +
      "\n\n" +
      `【プロフィール】\n・名前: ${profile.dogName || "未入力"}\n・犬種: ${
        profile.dogBreed || "未入力"
      }\n・年齢: ${profile.dogAge || "未入力"}歳\n・体重: ${
        profile.dogWeight || "未入力"
      }kg\n・性格: ${
        profile.dogPersonality || "未入力"
      }\n・生活環境: ${profile.livingEnv || "未入力"}\n・主な相談カテゴリ: ${
        profile.category || "未選択"
      }`;

    // チャット履歴に反映 & 画面描画
    state.messages.push({ role: "user", content: introMessage });
    appendMessage("user", introMessage);

    // AIに問い合わせ
    showThinking();
    const aiReply = await callChatAPI(introMessage);
    hideThinking();

    // AIメッセージ保存＆表示（セクション用ボタン付き）
    state.messages.push({ role: "assistant", content: aiReply });
    appendMessage("assistant", aiReply, true, [
      { type: "care", label: "ケアの詳細を見る" },
      { type: "hotel", label: "ホテルの詳細を見る" },
      { type: "fashion", label: "ファッションの詳細を見る" }
    ]);
  });

  /* -------------------------
   * チャット送信処理
   * ----------------------- */
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // ユーザー側に表示
    state.messages.push({ role: "user", content: text });
    appendMessage("user", text);
    chatInput.value = "";

    showThinking();
    const aiReply = await callChatAPI(text);
    hideThinking();

    state.messages.push({ role: "assistant", content: aiReply });
    appendMessage("assistant", aiReply);
  });
});
