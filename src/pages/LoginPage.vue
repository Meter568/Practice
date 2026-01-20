<script setup>
import "../css/login.css"
</script>

<template>
    <div class="login">
        <div class="right-area">
            <img src="../assets/Login_Image.png" alt="Login Image">
        </div>
        <div class="left-area">
            <div class="header">
                <div class="wrapper">
                    <div class="ar">
                        <h1>Affiliate Sign in</h1>
                    </div>
                    <div class="logo">
                        <img src="../assets/logo.png" alt="Logo">
                    </div>
                </div>
            </div>
            <div class="form">
                <form class="form-login">
                    <div class="row">
                        <label>Email</label>
                        <input type="email" required />
                    </div>
                    <div class="row">
                        <label>Password</label>
                        <input type="password" required autocomplete="on" />
                    </div>
                    <div class="row">
                        <button class="btn">Sign in</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>