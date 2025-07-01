const { OTP } = require('./db');
require('./deploy-commands.js');
require('dotenv').config();
const axios = require('axios');
const qs = require('qs');
const { Sequelize } = require('sequelize');
const {
  Client, GatewayIntentBits, Events,
  ButtonBuilder, ButtonStyle, ActionRowBuilder,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  InteractionType, MessageFlags
} = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Login sebagai ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {

  if (
  interaction.isChatInputCommand() &&
  interaction.commandName === 'input'
) {
  if (interaction.user.id !== OWNER_ID) {
    return interaction.reply({
      content: '❌ Hanya owner yang bisa menggunakan perintah ini.',
      flags: MessageFlags.Ephemeral
    });
  }

    const button = new ButtonBuilder()
      .setCustomId('open_modal')
      .setLabel('Register')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({
      content: 'Klik tombol di bawah untuk mengisi nama:',
      components: [row]
    });
  }

  if (interaction.isButton() && interaction.customId === 'verify_otp') {
    const modal = new ModalBuilder()
      .setCustomId('form_verifikasi')
      .setTitle('Verifikasi OTP');

    const otpInput = new TextInputBuilder()
      .setCustomId('otp_code')
      .setLabel('Masukkan kode OTP')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Contoh: 54321')
      .setRequired(true)
      .setMaxLength(5)
      .setMinLength(5);

    const row = new ActionRowBuilder().addComponents(otpInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'form_verifikasi') {
    const otpInput = interaction.fields.getTextInputValue('otp_code').trim();

    if (!/^\d{5}$/.test(otpInput)) {
      return interaction.reply({
        content: '❌ OTP harus 5 digit angka.',
        flags: MessageFlags.Ephemeral
      });
    }

    const match = await PlayerUCP.findOne({
      where: {
        code: otpInput,
        discord_id: interaction.user.id,
        verified: false
      }
    });

    if (match) {
      await match.update({ verified: true });

      return interaction.reply({
        content: `✅ OTP valid! Kamu telah terverifikasi.\nUsername: **${match.username}**\nNomor: **${match.phone}**`,
        flags: MessageFlags.Ephemeral
      });
    } else {
      return interaction.reply({
        content: '❌ OTP tidak ditemukan, salah, atau sudah dipakai.',
        flags: MessageFlags.Ephemeral
      });
    }
  }

  if (interaction.isButton() && interaction.customId === 'open_modal') {
    const modal = new ModalBuilder()
      .setCustomId('form_nama')
      .setTitle('Isi Data Kamu');

    const namaInput = new TextInputBuilder()
      .setCustomId('username')
      .setLabel('Masukkan username UCP')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('aruliazmi')
      .setRequired(true);

    const telpInput = new TextInputBuilder()
      .setCustomId('telepon')
      .setLabel('Nomor Telepon (gunakan 62)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('628xxxx')
      .setRequired(true);

    const row1 = new ActionRowBuilder().addComponents(namaInput);
    const row2 = new ActionRowBuilder().addComponents(telpInput);

    modal.addComponents(row1, row2);

    await interaction.showModal(modal);
  }

  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'form_nama') {
    const nama = interaction.fields.getTextInputValue('username').trim();
    const usernameValid = /^[a-zA-Z0-9]{5,}$/.test(nama);

    if (!usernameValid) {
      return interaction.reply({
        content: '❌ Username hanya boleh huruf/angka dan minimal 5 karakter (tanpa spasi atau simbol).',
        flags: MessageFlags.Ephemeral
      });
    }

    const telepon = interaction.fields.getTextInputValue('telepon');

    if (!telepon.startsWith('62')) {
      return interaction.reply({
        content: '❌ Nomor telepon harus diawali dengan 62.',
        flags: MessageFlags.Ephemeral
      });
    }

    const accountAgeMs = Date.now() - interaction.user.createdAt.getTime();
    const accountAge = accountAgeMs / (1000 * 60 * 60 * 24);

    if (accountAge < 7) {
      return interaction.reply({
        content: '❌ Akun Discord kamu harus berusia minimal 7 Hari untuk mendaftar.',
        flags: MessageFlags.Ephemeral
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const existing = await PlayerUCP.findOne({
      where: {
        [Sequelize.Op.or]: [
          { ucp: nama },
          { phone: telepon },
          { DiscordID: interaction.user.id }
        ]
      }
    });

    if (existing) {
      if (existing.verified) {
        return interaction.editReply({
          content: '✅ Kamu sudah terverifikasi sebelumnya.'
        });
      } else {
        return interaction.editReply({
          content: '❌ Username atau nomor telepon sudah terdaftar. Gunakan yang lain.'
        });
      }
    }

    const otp = Math.floor(10000 + Math.random() * 90000).toString();

    await PlayerUCP.create({
      ucp: nama,
      phone: telepon,
      verifycode: otp,
      DiscordID: interaction.user.id,
      verified: false
    });
    try {
      const fonnteRes = await axios.post(
        'https://api.fonnte.com/send',
        qs.stringify({
          target: telepon,
          message: `Hai ${nama}! Kode OTP kamu adalah: ${otp}, jangan bagikan kode ini ke siapapun.`
        }),
        {
          headers: {
            Authorization: process.env.FONNTE_TOKEN,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (fonnteRes.data && fonnteRes.data.status === true) {
        const verifyButton = new ButtonBuilder()
          .setCustomId('verify_otp')
          .setLabel('Verifikasi OTP')
          .setStyle(ButtonStyle.Success);

        const verifyRow = new ActionRowBuilder().addComponents(verifyButton);

        await interaction.editReply({
          content: `✅ OTP kamu telah dikirim ke WhatsApp ${telepon}`,
          components: [verifyRow]
        });
      } else {
        throw new Error('Fonnte gagal respon OK');
      }

    } catch (err) {
      console.error('❌ Gagal kirim ke Fonnte:', err.response?.data || err.message);

      await interaction.editReply({
        content: `❌ Gagal mengirim OTP ke WhatsApp.`
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
